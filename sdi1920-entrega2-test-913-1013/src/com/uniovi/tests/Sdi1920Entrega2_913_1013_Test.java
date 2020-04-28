package com.uniovi.tests;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;

//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;


//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class Sdi1920Entrega2_913_1013_Test {
	
	// CARMEN
//	static String PathFirefox65 = "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";
//	static String Geckdriver024 = "D:\\UNI\\Tercero\\SDI\\Sesion 5\\Material\\geckodriver024win64.exe";

	// RICHI
	static String PathFirefox65 = "D:\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "E:\\Clase\\SDI\\Material\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024); 
	static String URL = "http://localhost:8081";
	static String RESET = "http://localhost:8081/reset";


	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}


	@Before
	public void setUp(){
		// And the navigate to the web
		driver.navigate().to(URL);
	}
	
	@After
	public void tearDown(){
		driver.manage().deleteAllCookies();
	}
	
	@BeforeClass 
	static public void begin() {
		// Before the tests we reset the database
		driver.navigate().to(RESET);
		PO_View.setTimeout(10);

	}
	
	@AfterClass
	static public void end() {
		//Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	/********************************************************************************\
	
										WEB APPLICATION
		
	\********************************************************************************/
	
	/********************************************************************************\
	  									W1 - REGISTER
	\********************************************************************************/

	/**
	 * PR01 - User registry with valid data
	 */
	@Test
	public void PR01() {
		// We check always the homepage (login) is loaded
		PO_LoginView.checkElement(driver, "id", "email");
		// Then we navigate to the register
		PO_LoginView.goToRegister(driver);
		// Fill the form with valid data
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		// And check we are redirected to the users list
		PO_UsersView.checkElement(driver, "id", "tableUsers");
	}

	/**
	 * PR02 - User registry with invalid data, empty email, name and surname
	 * 
	 * The required of those inputs, won't let us advance to the next page, so we check we still are on Register
	 */
	@Test
	public void PR02() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// We fill the form with invalid data (empty email)
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "", "12345678", "12345678");
		// And we check we still are in the register page
		PO_RegisterView.checkElement(driver, "id", "iName");
		// Same with empty name
		PO_RegisterView.fillForm(driver, "", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
		// And empty surname
		PO_RegisterView.fillForm(driver, "", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
	}
	
	/**
	 * PR02_1 - User registry with invalid data, too short name and surname
	 */
	@Test
	public void PR02_1() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// We fill the form with invalid data (too short name)
		PO_RegisterView.fillForm(driver, "a", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		// And we check we still are in the register page and got an alert
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert");
		// Same with too short surname
		PO_RegisterView.fillForm(driver, "Lopen", "a", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert");		
	}
	
	/**
	 * PR02_2 - User registry with invalid data, too insecure password
	 */
	@Test
	public void PR02_2() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// Same as previous test with too short password
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "lopen@bridge4.com", "12", "12");
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert");		
	}

	/**
	 * PR03 - User registry with invalid data, passwords doesn't match
	 */
	@Test
	public void PR03() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// Same as previous test with not matching passwords
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "lopen@bridge4.com", "12345678", "abcdefgh");
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert");			
	}
	
	/**
	 * PR04 - User registry with invalid data, email already used
	 */
	@Test
	public void PR04() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// Same as previous test with already used email
		PO_RegisterView.fillForm(driver, "Dalinar", "Kholin", "dalinar@kholin.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert");		
	}
	
	/********************************************************************************\
										W2 - LOGIN
	\********************************************************************************/
	
	/**
	 * PR05 - Login with valid data, standard user
	 */
	@Test
	public void PR05() {
		assertTrue("PR05 sin hacer", false);			
	}
	
	/**
	 * PR06 - Login with invalid data, standard user, empty email and password
	 */
	@Test
	public void PR06() {
		assertTrue("PR06 sin hacer", false);			
	}
	
	/**
	 * PR07 - Login with invalid data, standard user, correct email with incorrect password
	 */
	@Test
	public void PR07() {
		assertTrue("PR07 sin hacer", false);			
	}	
	
	/**
	 * PR08 - Login with invalid data, standard user, incorrect email with not empty password
	 */
	@Test
	public void PR08() {
		assertTrue("PR08 sin hacer", false);			
	}	
	
	/********************************************************************************\
										W3 - LOGOUT
	\********************************************************************************/
	
	/**
	 * PR09. Logout. As logged user use the logout function and test it works properly
	 */
	@Test
	public void PR09() {
		assertTrue("PR09 sin hacer", false);			
	}	
	
	/**
	 * PR10. Logout. As anonymous user check the logout button is not visible.
	 */
	@Test
	public void PR10() {
		assertTrue("PR10 sin hacer", false);			
	}	
	
	/********************************************************************************\
										W4 - USERS LIST
	\********************************************************************************/
	
	/**
	 *  PR11. List Users. Show Users and check it list all the users it should list.
	 */
	@Test
	public void PR11() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We log in and check we are in the Users page
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		// We check the number of users in the first page (there should be five)
		PO_UsersView.checkUsers(driver, "Adolin", "Renarin", "Kaladin", "Shallan", "Jasnah");
		// We navigate to the second page
		PO_UsersView.changePage(driver, 2);
	}	
	
	/********************************************************************************\
										W5 - USERS SEARCH
	\********************************************************************************/
	
	/**
	 * PR12. Make a search with field empty and assert it shows all the users.
	 */
	@Test
	public void PR12() {
		assertTrue("PR12 sin hacer", false);			
	}	
	
	/**
	 * PR13. Make a search with a non existant text and assert it shows an empty list.
	 */
	@Test
	public void PR13() {
		assertTrue("PR13 sin hacer", false);			
	}	
	
	/**
	 *  PR14. Make a search with a valid text and assert it shows the correct users (more than 5).
	 */
	@Test
	public void PR14() {
		assertTrue("PR14 sin hacer", false);			
	}	
	
	
	/********************************************************************************\
									W6 - SEND FRIEND REQUEST
	\********************************************************************************/
	
	
	/**
	 * PR15. Send a valid friend requests and assert it shows up.
	 */
	@Test
	public void PR15() {
		assertTrue("PR15 sin hacer", false);			
	}	
	
	/**
	 * PR16. Try to send a request to an already requested user and assert to you can't.
	 */
	@Test
	public void PR16() {
		assertTrue("PR16 sin hacer", false);			
	}	
	
	/**
	 *  PR16_1. Try to send a request to an already friend user and assert you can't.
	 */
	@Test
	public void PR16_1() {
		assertTrue("PR16_1 sin hacer", false);			
	}
	
	/**
	 *  PR16_1. Try to send a friend request to yourself (through URL) and assert you can't
	 */
	@Test
	public void PR16_2() {
		assertTrue("PR16_2 sin hacer", false);			
	}
	
	/**
	 *  PR16_3. Try to send a friend request to someone that requested you, check it redirects you to the requests page
	 */
	@Test
	public void PR16_3() {
		assertTrue("PR16_3 sin hacer", false);			
	}
	
	/********************************************************************************\
										W7 - REQUESTS LIST
	\********************************************************************************/
	
	/**
	 * PR17. List Requests. List all the received requests.
	 */
	@Test
	public void PR17() {
		assertTrue("PR17 sin hacer", false);			
	}	
	
	/**
	 * PR17_1. List all the received requests with a user with no requests.
	 */
	@Test
	public void PR17_1() {
		assertTrue("PR17_1 sin hacer", false);			
	}
	
	/********************************************************************************\
										W8 - ACCEPT REQUEST
	\********************************************************************************/
	
	/**
	 * PR18. Accept a request amd check the friendship is established.
	 */
	@Test
	public void PR18() {
		assertTrue("PR18 sin hacer", false);			
	}	
	
	/**
	 * PR18_1. Try to accept a non-existant friend request (through URL) and assert you can't.
	 */
	@Test
	public void PR18_1() {
		assertTrue("PR18_1 sin hacer", false);			
	}
	
	/********************************************************************************\
										W9 - FRIENDS LIST
	\********************************************************************************/
	
	/**
	 * PR19. List Friends. Show the list of friends of the user and assert it shows what it must.
	 */
	@Test
	public void PR19() {
		assertTrue("PR19 sin hacer", false);			
	}	
	
	/**
	 * PR19_1. List Friends. Show the empty list of a user without friends.
	 */
	@Test
	public void PR19_1() {
		assertTrue("PR19_1 sin hacer", false);			
	}
	
	/********************************************************************************\
										W10 - SECURITY
	\********************************************************************************/
	
	/**
	 * PR20. Try to access the list of users as anonymous, check you can't.
	 */
	@Test
	public void PR20() {
		assertTrue("PR20 sin hacer", false);			
	}	
	
	/**
	 * PR21. Try to access the list of requests as anonymous, check you can't
	 */
	@Test
	public void PR21() {
		assertTrue("PR21 sin hacer", false);			
	}	
	
	/**
	 * PR22. Try to access the list of friends of other user.
	 * 
	 * With our design you can't access the list of friends of other users
	 * 	as we take the list of friends from the current authenticated user
	 * 
	 * We replaced that test for a check from an anonymous user
	 */
	@Test
	public void PR22() {
		assertTrue("PR22 sin hacer", false);			
	}	
	
	/**
	 * PR22_1. Try to access the list of friends as anonymous, check you can't
	 */
	@Test
	public void PR22_1() {
		assertTrue("PR22_1 sin hacer", false);			
	}
	
	/**
	 * PR22_2. Try to access the login form as logged user, check you can't
	 */
	@Test
	public void PR22_2() {
		assertTrue("PR22_2 sin hacer", false);			
	}
	
	/**
	 * PR22_3. Try to access the register form as logged user, check you can't
	 */
	@Test
	public void PR22_3() {
		assertTrue("PR22_3 sin hacer", false);			
	}
	

	/********************************************************************************\
	
										CLIENT APPLICATION
		
	\********************************************************************************/
	
	/********************************************************************************\
											C1 - LOGIN
	\********************************************************************************/
	
	/**
	 * PR23. Login with valid data
	 */
	@Test
	public void PR23() {
		assertTrue("PR23 sin hacer", false);			
	}	
	
	/**
	 * PR24. Login with invalid data (non existant user)
	 */
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);			
	}	
	
	/********************************************************************************\
										C2 - FRIEND LIST
	\********************************************************************************/	
	
	/**
	 * PR25. Access the list of friends of an user with at least three friends.
	 */
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);			
	}	
	
	/**
	 * PR26. Access the list of friends of an user, filter to find one exact friend. The searched name must match.
	 */
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);			
	}	
	
	
	/********************************************************************************\
										C3 - SHOW MESSAGES
	\********************************************************************************/

	/**
	 * PR27. Access the list of messages of a friend (chat), it must contain aat least three messages.
	 */
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);			
	}	
	
	
	/********************************************************************************\
										C4 - CREATE MESSAGES
	\********************************************************************************/
	
	/**
	 * PR28. Access the list of messages of a friend (chat) and create a new message.
	 * 	Validate that it appears in the list of messages.
	 */
	@Test
	public void PR28() {
		assertTrue("PR28 sin hacer", false);			
	}	
	
	
	/********************************************************************************\
										C5 - MARK AS READ AUTO
	\********************************************************************************/

	/**
	 * PR29. Identify in the app and send a message to a friend, validate that the sent message appears in the chat. 
	 * 	Identify next with the friend and validate that they have the message unread. 
	 * 	Enter the chat and check the message is marked as read.
	 */
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);			
	}
	
	
	/********************************************************************************\
										C6 - SHOW UNREAD MESSAGES
	\********************************************************************************/
	
	/**
	 * PR30. Identify in the app and send three messages to a friend, validate that the messages appears in the chat. 
	 * 	Identify next with the friend and validate that the number of unread messages appears in the list of friends.
	 */
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);			
	}
	
	
	/********************************************************************************\
										C7 - ORDER BY RECENT
	\********************************************************************************/
	
	/**
	 * PR31. Identify as user A with at least 3 friends. Go to the chat of the last friend and send him a message
	 * 	Ggo back to the list of friends and check that user appears now the first in the list. 
	 * 	Identify with the user B and send a message to user B. 
	 * 	Go back to identift as user A and see that the user that send them the message appears the first in the list.
	 */
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);			
	}
	
		
}

