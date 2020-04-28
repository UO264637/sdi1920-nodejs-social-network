package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_NavView  extends PO_View{

	/**
	 * CLicka una de las opciones principales (a href) y comprueba que se vaya a la vista con el elemento de tipo type con el texto Destino
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param textOption: Texto de la opción principal.
	 * @param criterio: "id" or "class" or "text" or "@attribute" or "free". Si el valor de criterio es free es una expresion xpath completa. 
	 * @param textoDestino: texto correspondiente a la búsqueda de la página destino.
	 */
	public static void clickOption(WebDriver driver, String textOption, String criterio, String textoDestino) {
		//CLickamos en la opci�n de registro y esperamos a que se cargue el enlace de Registro.
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "@href", textOption, getTimeout());
		//Tiene que haber un solo elemento.
		assertTrue(elementos.size()==1);
		//Ahora lo clickamos
		elementos.get(0).click();
		//Esperamos a que sea visible un elemento concreto
		elementos = SeleniumUtils.EsperaCargaPagina(driver, criterio, textoDestino, getTimeout());
		//Tiene que haber un solo elemento.
		assertTrue(elementos.size()==1);	
	}
	
	/**
	 * Navigates to the Register page (only visible when not logged in)
	 * @param driver
	 */
	static public void goToRegister(WebDriver driver) {
		// We load the elements leading to the register
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "@href", "signup", getTimeout());
		// There should be two elements
		assertTrue(elements.size()==2);
		// We click it
		elements.get(0).click();
		// And we wait for the register form to show up
		elements = SeleniumUtils.EsperaCargaPagina(driver, "id", "iName", getTimeout());
		// There should be only one element, the name input field
		assertTrue(elements.size()==1);	
	}
	
	/**
	 * Navigates to the Requests page (only visible when logged in)
	 * @param driver
	 */
	static public void goToRequests(WebDriver driver) {
		// We load the element leading to the requests
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "@href", "requests", getTimeout());
		// There should be one element
		assertTrue(elements.size()==1);
		// We click it
		elements.get(0).click();
		// And we wait for the requests table to show up
		elements = SeleniumUtils.EsperaCargaPagina(driver, "id", "tableRequests", getTimeout());
		// There should be only one element, the name input field
		assertTrue(elements.size()==1);	
	}
	
	/**
	 * Closes the session and redirects to the Login page (only visible when logged in)
	 * @param driver
	 */
	static public void logOut(WebDriver driver) {
		// We load the element leading to the logout
		List<WebElement> elements = SeleniumUtils.EsperaCargaPagina(driver, "@href", "logout", getTimeout());
		// There should be one element
		assertTrue(elements.size()==1);
		// We click it
		elements.get(0).click();
		// And we wait for the login form to show up
		elements = SeleniumUtils.EsperaCargaPagina(driver, "id", "email", getTimeout());
		// There should be only one element, the name input field
		assertTrue(elements.size()==1);	
	}

}
