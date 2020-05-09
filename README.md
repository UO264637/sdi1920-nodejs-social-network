## Introducción

El proyecto desarrollado es una red social con base en Node.js similar a la desarrollada en la entrega anterior, 
con menos funcionalidades en la aplicación web, pero con la adición de un widget que permite mensajear a los usuarios 
de la red con sus amigos agregados. El proyecto fue desarrollado por dos alumnos en dos semanas y media haciendo uso de 
GitHub para el control de versiones.

## Mapa de navegación

La aplicación está compuesta de dos entornos distintos, la aplicación web y el servicio de mensajería. Aunque ambas 
aplicaciones distinguen entre el estado del usuario entre estar autenticado o no lo cierto es que los usuarios anónimos 
carecen de cualquier funcionalidad que no sea entrar en la aplicación. A continuación, mostramos los mapas de 
navegación de ambos entornos.

[Navigation map](https://i.imgur.com/ofXgJcD.png)

## Aspectos técnicos y de diseño relevantes
### 1. Modelo

El primer desafío de diseño que hemos afrontado es el mismo que afrontamos en el proyecto anterior, definir el modelo 
de datos de la aplicación. Sin embargo, esta vez no usamos una base de datos relacional sino una base de datos 
documental por lo que hemos realizado ciertas variaciones.

En esta aplicación se enriquece la entidad User y desaparece Friendship. User contiene nombre, apellidos, email, rol y 
contraseña encriptada del usuario, así como las id de sus amigos. Puesto que la carga de las amistades siempre responde 
a recuperar el listado de un usuario concreto creímos que la mejor estrategia era contener esos amigos en cada usuario, 
sirviéndonos de las capacidades de los documentos para guardar vectores de datos. Así pues, cada vez que se establece 
una amistad, el id del otro usuario es añadido a la lista de amigos de cada uno.

Sí dejamos como una entidad propia a las Requests, en vez de generar una lista de peticiones pendientes en cada usuario 
creamos un elemento conteniendo el usuario que la solicitó y el solicitado. Esta decisión deriva del carácter efímero 
de las peticiones, estas son creadas para ser aceptadas o rechazadas al poco tiempo, de forma que no merece la pena 
trabajar con un usuario completo para almacenarlas y por ello las hemos abstraído.

Por último, nos falta hablar de Messages, el sistema con el que almacenamos los mensajes del chat en la base de datos a 
través de la cual permitimos la comunicación entre los usuarios. Se nos ocurrieron dos posibles acercamientos para 
tratar los mensajes, el primero era el de crear un objeto Chat que contuviese una lista de usuarios participantes en 
el mismo y otra lista conteniendo los mensajes. De primeras este nos pareció el mejor acercamiento, al permitir 
encapsular los mensajes dentro de cada chat y ofreciendo la posibilidad de añadir la funcionalidad de crear grupos de 
mensajería con facilidad pues la lista de usuarios implicados siempre podría albergar más usuarios. 

Aún con todo, tras examinar las expansiones necesarias cambiamos de idea y decidimos que cada mensaje sería un objeto 
en si mismo y que serían recuperados por lotes. Cada mensaje guarda la id del usuario que lo envió, la del que lo 
recibió, el texto que contiene, su estado (leído o no leído) y el momento temporal en que fue enviado. De esta forma 
podemos manipularlos con más facilidad para sus modificaciones (marcarlos como leídos), inserciones o, de desarrollarse 
en el futuro, borrado.

Por último, nos gustaría tratar el tema de los roles, nuestro primer planteamiento era semejante al de la entrega 
anterior, convertir los roles en entidades en sí mismas, que contuviese el nombre del mismo y un listado de 
privilegios, empero, este acercamiento habría añadido una complejidad innecesaria para las funcionalidades de nuestra 
aplicación. Al final decidimos guardar los nombres como simples cadenas y que cada funcionalidad sea la que juzgue los 
permisos en base a eso.

[Model](https://i.imgur.com/idCmb2o.png)

### 2. Roles

En la entrega inicial este punto era más relevante al haber mucha más diferencia entre los administradores y los 
usuarios estándar pero igualmente existen diferencias. Hemos decidido mantener las decisiones de la entrega inicial 
respecto a las amistades de los administradores, no puede tener amistades. Los administradores son invisibles para el 
resto de los usuarios, por tanto, no deben poder ser agregados ni agregar a otros usuarios. A extensión de esto, los 
administradores no pueden usar el servicio de mensajería al carecer de amistades con las que comunicarse.

### 3. Gestión de peticiones de amistad

Muy similar a la entrega anterior, el conflicto reside en el envío de una petición de amistad a un usuario que ya se la 
había solicitado a aquel que la intenta enviar. La decisión tomada es la misma, no se debe permitir esa solicitud, pero 
se debe avisar al usuario de la existencia de la misma y redirigirlo a la página de peticiones, donde la podrá aceptar 
y forjar la amistad, mejorando la usabilidad. Todo según la misma motivación, cada página tiene una intención concreta 
y debería limitarse a esta, un botón de enviar una petición no debería forjar una amistad, ni un botón de aceptar 
amistad debería aparecer en un listado donde se solicitan.

### 4. Abstracción de las consultas

A raíz de nuestra experiencia con los entregables teníamos el temor de que el módulo de consultas a la base de datos 
terminase siendo un fichero demasiado extenso con métodos dedicados a la obtención, inserción, modificación o 
eliminación de cada entidad. Para enfocar esto nuestra primera idea fue la de dividir las responsabilidades del módulo 
y generar varios dedicados en exclusiva a cada entidad, convirtiéndolos en servicios especializados.

No obstante, tras evaluar los métodos con lo que iban contar nos dimos cuenta de que todos los métodos de CRUD eran en 
esencia iguales al no haber casos complejos como eran las inserciones de canciones en los entregables, por poner un 
ejemplo. Por ello decidimos que las funciones de CRUD fuesen genéricas y que la colección a consultar se especificase 
a la vez que la consulta a realizar, lo que nos dejó un módulo muy compacto y mantenible con el único pago a cambio de 
un parámetro extra en cada consulta.

Además, ante el uso de consultas en la aplicación tanto por medio de promesas como de callbacks, decidimos combinar ambos sistemas en la misma función, las cuales efectuarán una u otra según la presencia o no de una función de callback especificada en la llamada.

### 5. Diseño del servicio de mensajería

Inspirados en las versiones de escritorio de los servicios de mensajería más famosos (Telegram y WhatsApp) decidimos 
afrontar este servicio de una forma distinta a la enseñada en los entregables. En lugar de sustituir un widget por otro 
al invocar las funciones del último decidimos mantener a ambos en pantalla, cada uno a un lado, de esta forma cada vez 
que se selecciona un amigo con el que abrir un nuevo chat, no cerramos el widget de amistades para abrir la 
conversación respectiva, sino que desplegamos la conversación en el contenedor asociada a esta facilitando mucho al 
usuario la navegación entre conversaciones.

Esto planteó ciertas complicaciones en la implementación, como la carga correcta de mensajes en cambios veloces de 
chat. Durante las pruebas descubrimos que la apertura secuencial de dos conversaciones en espacios de tiempo muy breves 
desplegaba la carga de los mensajes de la primera en la ventana de la segunda debido a la asincronicidad del proceso. 
Esto empeoró al implementar el refresco automático de mensajes que realizaba consultas periódicas que podían provocar 
esto incluso cuando solo se cambiaba a otra conversación sin haber abierto una inmediatamente antes.

Resolvimos estos conflictos guardando el usuario del que recuperar los mensajes en cada consulta realizada para ese 
motivo y comprobando al imprimirlas que la conversación desplegada seguía siendo la misma, una solución parecida a la 
que implementamos para decidir cuando recargar o no los mensajes y amigos. Actualizar constantemente los mensajes y 
amigos en cada llamada provocaba un parpadeo constante y ciertos errores derivados, de forma que guardamos siempre la 
cantidad de mensajes de la petición anterior para saber si hubo alguna variación que justifique la recarga de elementos.

## Información necesaria para el despliegue y ejecución

Para llevar a cabo el despliegue de la aplicación solo es necesario tener instalado Node.js en el equipo en el que se 
vaya a realizar. El procedimiento para lanzarlo pasa por acudir a la raíz del repositorio y ejecutar primero el 
comando npm install para la actualización de los paquetes del proyecto y posteriormente a esa actualización ejecutar 
npm start o nodemon app.js.

La ejecución de los test necesita tener la aplicación funcionando en el puerto 8081 (puerto para el que ya está 
preparada por defecto). El proyecto de pruebas ya está configurado con las librerías necesarias para su ejecución. 
Estos están pensados para ser ejecutados secuencialmente, esto es importante para la verificación de la integridad de 
los datos que evalúan, dicha secuencia completa puede llevar cierto tiempo. Si los import fallan lo mejor es 
hacer un Clean.

Antes de realizarse los test está programada una llamada de reseteo a la base de datos, así que tampoco debe hacerse 
nada al respecto antes de lanzarlos. Un par de advertencias son necesarias respecto a ello: primero, tener un navegador 
con el widget desplegado durante las pruebas puede provocar disrupciones en estas; y, además, durante los test se hace 
un gran número de consultas a la base de datos, sobre todo en el reseteo, a veces la cantidad es tal que MongoDB las 
limita y provoca el fallo de las pruebas. Si esto sucediese, se recomienda esperar antes de volver a lanzar la batería. 
En principio no debería ocurrir salvo que se haga múltiples veces en un pequeño espacio de tiempo, una no suele 
provocar dicho bloqueo.

## Conclusión

Con la experiencia acumulada de las entregas semanales y de la creación de una aplicación similar en la parte de 
Spring el desarrollo de este entregable resultó muy cómodo al no exigir muchos conocimientos por encima de los ya 
adquiridos. Aún con todo, ciertos retos se presentaron y necesitaron de un esfuerzo extra por nuestra parte para su 
resolución.

Los más resaltables son aquellos relacionados con la asincronicidad. Primero, para conseguir el lanzamiento de varias 
consultas múltiples a la base de datos en la realización de comprobaciones que se pudiese llevar a cabo sin una cadena 
interminable de funciones callback, esto nos llevó a aprender a lidiar con promesas, algo complicado al principio pero 
que acabamos haciendo muy cómodamente hacia el final. El otro gran desafío iba relacionado, las condiciones de carrera 
provocadas en el servicio de chat, solventadas metiendo el uso de unos bloqueadores que sirviesen para comprobar que 
respuestas AJAX debían ser tratadas, algo que también extendimos para optimizar el refresco de la página.

Consideramos haber conseguido repartir el trabajo a partes iguales de nuevo. Encargándonos cada uno de la mitad de los 
puntos presentados por el guion y de sus respectivas pruebas. Eso no eludió cooperación entre las partes, los 
problemas con la asincronicidad del chat se resolvieron es un esfuerzo conjunto por poner un ejemplo.

En resumen, creemos haber desarrollado un proyecto del que estamos incluso más orgullosos que el anterior, aunque 
fuese en parte gracias al susodicho, está claro que hemos aprendido bastante durante este desarrollo.
