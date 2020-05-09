package com.uniovi.tests;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;

import java.util.List;

//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;
import com.uniovi.tests.util.SeleniumUtils;


//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING) 
public class Sdi1920Entrega2_913_1013_Test {
	
	// CARMEN
	static String PathFirefox65 = "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "D:\\UNI\\Tercero\\SDI\\Sesion 5\\Material\\geckodriver024win64.exe";

	// RICHI
//	static String PathFirefox65 = "D:\\Mozilla Firefox\\firefox.exe";
//	static String Geckdriver024 = "E:\\Clase\\SDI\\Material\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	
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
		PO_RegisterView.fillForm(driver, "a", "Bridge 4", "teft@bridge4.com", "12345678", "12345678");
		// And we check we still are in the register page and got a warning alert
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert-warning");
		// Same with too short surname
		PO_RegisterView.fillForm(driver, "Teft", "a", "teft@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert-warning");		
	}
	
	/**
	 * PR02_2 - User registry with invalid data, too insecure password
	 */
	@Test
	public void PR02_2() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// Same as previous test with too short password
		PO_RegisterView.fillForm(driver, "Teft", "Bridge 4", "teft@bridge4.com", "12", "12");
		PO_RegisterView.checkElement(driver, "id", "iName");
		PO_RegisterView.checkElement(driver, "class", "alert-danger");		
	}

	/**
	 * PR03 - User registry with invalid data, passwords doesn't match
	 */
	@Test
	public void PR03() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.goToRegister(driver);
		// Same as previous test with not matching passwords
		PO_RegisterView.fillForm(driver, "Teft", "Bridge 4", "teft@bridge4.com", "12345678", "abcdefgh");
		PO_RegisterView.checkElement(driver, "id", "iName");
		// In this case the page prints a danger alert
		PO_RegisterView.checkElement(driver, "class", "alert-warning");			
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
		PO_RegisterView.checkElement(driver, "class", "alert-warning");		
	}
	
	/********************************************************************************\
										W2 - LOGIN
	\********************************************************************************/
	
	/**
	 * PR05 - Login with valid data, standard user
	 */
	@Test
	public void PR05() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We log in and check we are in the Users page
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");		
	}
	
	/**
	 * PR06 - Login with invalid data, standard user, empty email and password
	 * 
	 * The required of those inputs, won't let us advance to the next page, so we check we still are on Login
	 */
	@Test
	public void PR06() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We try to log in
		PO_LoginView.fillForm(driver, "", "");
		// Check the user is still in the login
		PO_UsersView.checkNoText(driver, "Surname");
		PO_LoginView.checkElement(driver, "text", "Welcome to MySocialNetwork");
	}
	
	/**
	 * PR07 - Login with invalid data, standard user, correct email with incorrect password
	 */
	@Test
	public void PR07() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We try to log in
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "456");
		// Check there is a warning
		PO_LoginView.checkElement(driver, "class", "alert-warning");
		PO_LoginView.checkElement(driver, "text", "Incorrect");
	}	
	
	/**
	 * PR08 - Login with invalid data, standard user, incorrect email with not empty password
	 */
	@Test
	public void PR08() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We try to log in
		PO_LoginView.fillForm(driver, "palomar@kholin.com", "123");
		// Check there is a warning
		PO_LoginView.checkElement(driver, "class", "alert-warning");
		PO_LoginView.checkElement(driver, "text", "Incorrect");			
	}	
	
	/********************************************************************************\
										W3 - LOGOUT
	\********************************************************************************/
	
	/**
	 * PR09. Logout. As logged user use the logout function and test it works properly
	 */
	@Test
	public void PR09() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We log in
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		// Log out
		PO_LoginView.checkElement(driver, "text", "Logout");
		PO_UsersView.logOut(driver);
		// Check we are back in log in
		PO_LoginView.checkElement(driver, "text", "Welcome to MySocialNetwork");
		PO_LoginView.checkElement(driver, "id", "email");
	}	
	
	/**
	 * PR10. Logout. As anonymous user check the logout button is not visible.
	 */
	@Test
	public void PR10() {
		PO_UsersView.checkNoText(driver, "Logout");			
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
		// We check the number of users in the first page (there should be this five)
		PO_UsersView.checkUsers(driver, "Adolin", "Renarin", "Kaladin", "Shallan", "Jasnah");
		// We navigate to the second page and check its users
		PO_UsersView.changePage(driver, 2);
		PO_UsersView.checkUsers(driver, "Navani", "Elhokar", "Sadeas", "Roca", "Hoid");
		// We navigate to the third page and check there's the test registered user
		PO_UsersView.changePage(driver, 3);
		PO_UsersView.checkUsers(driver, "Lopen");
	}	
	
	/********************************************************************************\
										W5 - USERS SEARCH
	\********************************************************************************/
	
	/**
	 * PR12. Make a search with field empty and assert it shows all the users.
	 */
	@Test
	public void PR12() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		// We insert our empty search
		PO_UsersView.search(driver, "");
		// There should be the same users than the previous test
		PO_UsersView.checkUsers(driver, "Adolin", "Renarin", "Kaladin", "Shallan", "Jasnah");
		PO_UsersView.changePage(driver, 2);
		PO_UsersView.checkUsers(driver, "Navani", "Elhokar", "Sadeas", "Roca", "Hoid");
		PO_UsersView.changePage(driver, 3);
		PO_UsersView.checkUsers(driver, "Lopen");
	}	
	
	/**
	 * PR13. Make a search with a non existent text and assert it shows an empty list.
	 */
	@Test
	public void PR13() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		// We insert our search
		PO_UsersView.search(driver, "Moash");
		// There should be the no users
		PO_UsersView.checkUsers(driver);		
	}	
	
	/**
	 *  PR14. Make a search with a valid text and assert it shows the correct users (more than 5).
	 */
	@Test
	public void PR14() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		// We insert our search
		PO_UsersView.search(driver, "ho");
		// And we check the expected users
		PO_UsersView.checkUsers(driver, "Adolin", "Renarin", "Jasnah", "Navani", "Elhokar");
		PO_UsersView.changePage(driver, 2);
		PO_UsersView.checkUsers(driver, "Hoid");		
	}	
	
	
	/********************************************************************************\
									W6 - SEND FRIEND REQUEST
	\********************************************************************************/
	
	
	/**
	 * PR15. Send a valid friend requests and assert it shows up.
	 */
	@Test
	public void PR15() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "roca@bridge4.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We send a friend request to a valid user
		PO_UsersView.sendFrienRequest(driver, "shallan@davar.com");
		// We check we got a success alert
		PO_UsersView.checkElement(driver, "class", "alert-success");
		// We log in as the requested friend
		PO_UsersView.logOut(driver);
		PO_LoginView.fillForm(driver, "shallan@davar.com", "123");
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We navigate to the friend requests page
		PO_UsersView.goToRequests(driver);
		// We check we got the Roca request
		PO_RequestsView.checkElement(driver, "text", "Roca");
	}	
	
	/**
	 * PR16. Try to send a request to an already requested user and assert that you can't.
	 */
	@Test
	public void PR16() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "hoid@sagaz.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We try send a friend request to an already requested user
		PO_UsersView.sendFrienRequest(driver, "dalinar@kholin.com");
		// We check we didn't get the success alert
		PO_UsersView.checkNoText(driver, "successfully");
	}	
	
	/**
	 *  PR16_1. Try to send a request to an already friend user and assert you can't.
	 */
	@Test
	public void PR16_1() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We try send a friend request to a friend
		PO_UsersView.sendFrienRequest(driver, "adolin@kholin.com");
		// We check we didn't get the success alert
		PO_UsersView.checkNoText(driver, "successfully");	
	}
	
	/**
	 *  PR16_2. Try to send a friend request to someone that requested you, check it redirects you to the requests page
	 */
	@Test
	public void PR16_2() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		PO_UsersView.changePage(driver, 2);
		// We try send a friend request to a user that already requested us
		PO_UsersView.sendFrienRequest(driver, "hoid@sagaz.com");
		// We check we get redirected to the Requests page
		PO_RequestsView.checkElement(driver, "id", "tableRequests");
	}
	
	/**
	 *  PR16_3. Try to send an invalid request with the URL to: 
	 *  	Yourself, an admin, a friend, a inexistent user, to someone that already requested you using the URL
	 *  Check it redirects you to the users page with an alert
	 */
	@Test
	public void PR16_3() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "jasnah@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We navigate to the URL to send a request to ourselves
		driver.navigate().to(URL + "/requests/send/jasnah@kholin.com");
		// We check we got redirected to the Users page with an alert
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		PO_UsersView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to send a request to an admin
		driver.navigate().to(URL + "/requests/send/admin@email.com");
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		PO_UsersView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to send a request to a friend
		driver.navigate().to(URL + "/requests/send/dalinar@kholin.com");
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		PO_UsersView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to send a request to a inexistent user
		driver.navigate().to(URL + "/requests/send/taravangian@karbranth.com");
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		PO_UsersView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to send a request to a requester
		driver.navigate().to(URL + "/requests/send/adolin@kholin.com");
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		PO_UsersView.checkElement(driver, "class", "alert-warning");
	}
	
	
	/********************************************************************************\
										W7 - REQUESTS LIST
	\********************************************************************************/
	
	/**
	 * PR17. List Requests. List all the received requests.
	 */
	@Test
	public void PR17() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "jasnah@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We go to the requests page
		PO_UsersView.goToRequests(driver);
		// And we check the expected users
		PO_RequestsView.checkUsers(driver, "Adolin", "Renarin", "Navani", "Elhokar", "Torol");
		PO_RequestsView.changePage(driver, 2);
		PO_RequestsView.checkUsers(driver, "Hoid");
	}	
	
	/**
	 * PR17_1. List all the received requests with a user with no requests.
	 */
	@Test
	public void PR17_1() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "torol@sadeas.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		PO_UsersView.goToRequests(driver);
		// And we check the expected users
		PO_RequestsView.checkUsers(driver);		
	}
	
	/********************************************************************************\
										W8 - ACCEPT REQUEST
	\********************************************************************************/
	
	/**
	 * PR18. Accept a request and check the friendship is established.
	 */
	@Test
	public void PR18() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		PO_UsersView.goToRequests(driver);
		PO_RequestsView.acceptFrienRequest(driver, "Hoid");
		// We check we got a success alert
		PO_UsersView.checkElement(driver, "class", "alert-success");
		// We navigate to the friend requests page
		PO_UsersView.goToFriends(driver);
		// We check the accepted user is now on friends
		PO_TableView.changePage(driver, 2);
		PO_TableView.checkElement(driver, "text", "Hoid");
		// We log in as the accepted user
		PO_UsersView.logOut(driver);
		PO_LoginView.fillForm(driver, "hoid@sagaz.com", "123");
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		PO_UsersView.goToFriends(driver);
		// And check the original user appears in the friend list
		PO_TableView.checkElement(driver, "text", "Dalinar");
	}	
	
	/**
	 * PR18_1. Try to accept a inexistent friend request (through URL) and assert you can't.
	 * 	Of yourself, an admin, a friend, an inexistent user and a user that didn't request you
	 */
	@Test
	public void PR18_1() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");
		// We navigate to the URL to accept the invalid friendship of ourselves
		driver.navigate().to(URL + "/friends/accept/dalinar@kholin.com");
		// We check we got redirected to the Requests page with an alert
		PO_RequestsView.checkElement(driver, "id", "tableRequests");
		PO_RequestsView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to accept the invalid friendship of an admin
		driver.navigate().to(URL + "/friends/accept/admin@email.com");
		PO_RequestsView.checkElement(driver, "id", "tableRequests");
		PO_RequestsView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to accept the invalid friendship of a friend
		driver.navigate().to(URL + "/friends/accept/adolin@kholin.com");
		PO_RequestsView.checkElement(driver, "id", "tableRequests");
		PO_RequestsView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to accept the invalid friendship of an inexistent user
		driver.navigate().to(URL + "/friends/accept/gavilar@kholin.com");
		PO_RequestsView.checkElement(driver, "id", "tableRequests");
		PO_RequestsView.checkElement(driver, "class", "alert-warning");
		// We navigate to the URL to accept the invalid friendship of a user that didn't request you
		driver.navigate().to(URL + "/friends/accept/roca@bridge4.com");
		PO_RequestsView.checkElement(driver, "id", "tableRequests");
		PO_RequestsView.checkElement(driver, "class", "alert-warning");
	}
	
	/********************************************************************************\
										W9 - FRIENDS LIST
	\********************************************************************************/
	
	/**
	 * PR19. List Friends. Show the list of friends of the user and assert it shows what it must.
	 */
	@Test
	public void PR19() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "kaladin@bridge4.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		// We go to the friend page	
		PO_UsersView.goToFriends(driver);	
		// And we check the expected users
		PO_RequestsView.checkUsers(driver, "Dalinar", "Adolin", "Renarin", "Shallan", "Navani");
		PO_RequestsView.changePage(driver, 2);
		PO_RequestsView.checkUsers(driver, "Roca"); // Con Numuhukumakiaki'aialunamor no funciona :P
	}	
	
	/**
	 * PR19_1. List Friends. Show the empty list of a user without friends.
	 */
	@Test
	public void PR19_1() {
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.logAs(driver, "torol@sadeas.com", "123");	
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
		PO_UsersView.goToFriends(driver);	
		// And we check the expected users
		PO_RequestsView.checkUsers(driver);	
	}
	
	/********************************************************************************\
										W10 - SECURITY
	\********************************************************************************/
	
	/**
	 * PR20. Try to access the list of users as anonymous, check you can't.
	 */
	@Test
	public void PR20() {
		// We navigate to the users URL
		driver.navigate().to(URL + "/users");	
		// We check we get redirected to the login
		PO_LoginView.checkElement(driver, "id", "email");		
	}	
	
	/**
	 * PR21. Try to access the list of requests as anonymous, check you can't
	 */
	@Test
	public void PR21() {
		// We navigate to the requests URL
		driver.navigate().to(URL + "/requests");	
		// We check we get redirected to the login
		PO_LoginView.checkElement(driver, "id", "email");		
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
		// We navigate to the friends URL
		driver.navigate().to(URL + "/friends");	
		// We check we get redirected to the login
		PO_LoginView.checkElement(driver, "id", "email");				
	}	
	
	/**
	 * PR22_2. Try to access the login form as logged user, check you can't
	 */
	@Test
	public void PR22_1() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We log in
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");
		// We navigate to the login URL
		driver.navigate().to(URL + "/login");	
		// We check we get redirected to the users
		PO_UsersView.checkElement(driver, "id", "tableUsers");
	}
	
	/**
	 * PR22_2. Try to access the register form as logged user, check you can't
	 */
	@Test
	public void PR22_2() {
		PO_LoginView.checkElement(driver, "id", "email");
		// We log in
		PO_LoginView.logAs(driver, "dalinar@kholin.com", "123");
		// We navigate to the login URL
		driver.navigate().to(URL + "/signup");	
		// We check we get redirected to the users
		PO_UsersView.checkElement(driver, "id", "tableUsers");	
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
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
		
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
		
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
	}	
	
	/**
	 * PR24. Login with invalid data (non existant user)
	 */
	@Test
	public void PR24() {
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
				
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "palomar@kholin.com", "123");
				
		// Check we are in the Friends list
		PO_View.checkNoText(driver, "Friends");
		// And a warning shows
		PO_View.checkNoText(driver, "User not fond");	
	}	
	
	/********************************************************************************\
										C2 - FRIEND LIST
	\********************************************************************************/	
	
	/**
	 * PR25. Access the list of friends of an user with at least three friends.
	 */
	@Test
	public void PR25() {
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
						
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
						
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		// Check the friends appear
		PO_View.checkElement(driver, "text", "Navani");	
		PO_View.checkElement(driver, "text", "Elhokar");
		PO_View.checkElement(driver, "text", "Kaladin");
		PO_View.checkElement(driver, "text", "Adolin");
		PO_View.checkElement(driver, "text", "Renarin");
		PO_View.checkElement(driver, "text", "Jasnah");
	}	
	
	/**
	 * PR26. Access the list of friends of an user, filter to find one exact friend. The searched name must match.
	 */
	@Test
	public void PR26() {
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
						
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
								
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		
		// Search by "Ka"
		WebElement search = driver.findElement(By.id("name-filter"));
		search.click();
		search.clear();
		search.sendKeys("Ka");
		
		By button = By.className("fa");
		driver.findElement(button).click();
		
		// Check KAladin and ElhoKAr appear
		PO_View.checkElement(driver, "text", "Elhokar");
		PO_View.checkElement(driver, "text", "Kaladin");		
	}	
	
	
	/********************************************************************************\
										C3 - SHOW MESSAGES
	\********************************************************************************/

	/**
	 * PR27. Access the list of messages of a friend (chat), it must contain at least three messages.
	 */
	@Test
	public void PR27() {
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
								
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
										
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		
		// Select a chat
		PO_View.checkElement(driver, "text", "Elhokar"); // Wait for the friend to appear
		WebElement friend = driver.findElement(By.id("elhokar@kholin.com"));
		friend.click();
				
		// Check chat appears ( I removed all the ' because it didn't find them correctly)
		PO_View.checkElement(driver, "text", "Make me High Prince of War.");
		PO_View.checkElement(driver, "text", "No, I can");
		PO_View.checkElement(driver, "text", "I made Sadeas High Prince of Information");
		PO_View.checkElement(driver, "text", "ll kill you");
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
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
								
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
										
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		
		// Select a chat
		PO_View.checkElement(driver, "text", "Elhokar"); // Wait for the friend to appear
		WebElement friend = driver.findElement(By.id("elhokar@kholin.com"));
		friend.click();
		
		// Check the message does not exist
		PO_View.checkNoText(driver, "New message");
				
		// Writte and send the message
		WebElement message = driver.findElement(By.id("message-text"));
		message.click();	
		message.clear();
		message.sendKeys("New message");
		
		WebElement button = driver.findElement(By.className("msg_send_btn"));
		button.click();
		
		// Check the message appears
		PO_View.checkElement(driver, "text", "New message");
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
		// FIRST USER (Dalinar)
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
								
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
										
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		
		// Select a chat
		PO_View.checkElement(driver, "text", "Renarin"); // Wait for the friend to appear
		WebElement friend = driver.findElement(By.id("renarin@kholin.com"));
		friend.click();
		
		// Check the message does not exist
		PO_View.checkNoText(driver, "New message");
				
		// Writte and send the message
		WebElement message = driver.findElement(By.id("message-text"));
		message.click();	
		message.clear();
		message.sendKeys("Hello");
		
		WebElement button = driver.findElement(By.className("msg_send_btn"));
		button.click();
		
		// Check the message appears
		PO_View.checkElement(driver, "text", "Hello");
		
		// Check it is unread
		Boolean resultado = 
				(new WebDriverWait(driver, 2)).until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//*[contains(@class,'fa-eye')]")));
		assertTrue(resultado);
		
		
		
		// SECOND USER (Renarin)
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
										
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "renarin@kholin.com", "123");
												
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
				
		// Select a chat
		PO_View.checkElement(driver, "text", "Dalinar"); // Wait for the friend to appear
		friend = driver.findElement(By.id("dalinar@kholin.com"));
		friend.click();
		
		// Check the message appears
		PO_View.checkElement(driver, "text", "Hello");		
		
		// Check it is read
		WebElement readMessage = 
				(new WebDriverWait(driver, 2)).until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[contains(@class,'fa-eye')]")));
		assertTrue(readMessage != null);
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
		// FIRST USER (Dalinar)
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
										
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
												
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
				
		// Select a chat
		PO_View.checkElement(driver, "text", "Adolin"); // Wait for the friend to appear
		WebElement friend = driver.findElement(By.id("adolin@kholin.com"));
		friend.click();
				
		// Check the message does not exist
		PO_View.checkNoText(driver, "New message");
						
		// Writte and send the messages
		WebElement message = driver.findElement(By.id("message-text")); // First one
		message.click();	
		message.clear();
		message.sendKeys("Hello");
				
		WebElement button = driver.findElement(By.className("msg_send_btn")); 
		button.click();
				
		// Second one
		message.click();	
		message.clear();
		message.sendKeys("How are you?");
			
		button.click();
				
		// Third one
		message.click();	
		message.clear();
		message.sendKeys(":D");
				
		button.click();
				
		// Check the messages appear
		PO_View.checkElement(driver, "text", "Hello");
		PO_View.checkElement(driver, "text", "How are you?");
		PO_View.checkElement(driver, "text", ":D");				
				
				
		// SECOND USER (Adolin)
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
										
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "adolin@kholin.com", "123");
														
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
						
		// Check unread messages
		PO_View.checkElement(driver, "text", "3");					

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
		// FIRST USER (Dalinar)
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
												
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
														
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		
		// Select the last friend (Jasnah)
		List<WebElement> friends = SeleniumUtils.EsperaCargaPaginaxpath(driver, "//*[contains(@class,'friend')]", 2);
		friends.get(friends.size()-1).click();
		
		// Writte and send the message		
		WebElement message = driver.findElement(By.id("message-text"));
		message.click();	
		message.clear();
		message.sendKeys("Message for the last friend");
						
		WebElement button = driver.findElement(By.className("msg_send_btn")); 
		button.click();
		
		// Show the friends again
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "dalinar@kholin.com", "123");
		PO_View.checkElement(driver, "text", "Friends");
		
		// Enter the first chat and see the message is there
		friends = SeleniumUtils.EsperaCargaPaginaxpath(driver, "//*[contains(@class,'friend')]", 2);
		friends.get(0).click();
		PO_View.checkElement(driver, "text", "Message for the last friend");
		
		
		
		// SECOND USER (Jasnah)
		// We go to the client URL
		driver.navigate().to(URL + "/cliente.html");
														
		// Log in
		PO_LoginView.checkElement(driver, "id", "email");
		PO_LoginView.fillForm(driver, "shallan@davar.com", "123");
																
		// Check we are in the Friends list
		PO_View.checkElement(driver, "text", "Friends");
		
		// Enter the first chat and see the message is there
		friends = SeleniumUtils.EsperaCargaPaginaxpath(driver, "//*[contains(@class,'friend')]", 2);
		friends.get(0).click();
		PO_View.checkElement(driver, "text", "Message for the last friend");
	}		
}

