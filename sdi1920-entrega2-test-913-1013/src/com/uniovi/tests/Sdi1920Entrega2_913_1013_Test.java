package com.uniovi.tests;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;

import java.util.List;

//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
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
	  										SIGN UP TESTS
	\********************************************************************************/

	/**
	 * PR01 - User registry with valid data
	 */
	@Test
	public void PR01() {
		PO_HomeView.goToRegister(driver);
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		PO_View.checkElement(driver, "id", "tableUsers");
	}

	/**
	 * PR02 - User registry with invalid data, empty email, name and surname
	 * 
	 * The required of those inputs, won't let us advance to the next page, so we check we still are on Register
	 */
	@Test
	public void PR02() {
		PO_HomeView.goToRegister(driver);
		// Empty email
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
		// Empty name
		PO_RegisterView.fillForm(driver, "", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
		// Empty surname
		PO_RegisterView.fillForm(driver, "", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "id", "iName");
	}
	
	/**
	 * PR02_1 - User registry with invalid data, too short name and surname
	 */
	@Test
	public void PR02_1() {
		PO_HomeView.goToRegister(driver);
		// Too short name
		PO_RegisterView.fillForm(driver, "a", "Bridge 4", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "class", "alert");
		// Too short surname
		PO_RegisterView.fillForm(driver, "Lopen", "a", "lopen@bridge4.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "class", "alert");		
	}
	
	/**
	 * PR02_2 - User registry with invalid data, too insecure password
	 */
	@Test
	public void PR02_2() {
		PO_HomeView.goToRegister(driver);
		// Too short name
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "lopen@bridge4.com", "12", "12");
		PO_RegisterView.checkElement(driver, "class", "alert");		
	}

	/**
	 * PR03 - User registry with invalid data, passwords doesn't match
	 */
	@Test
	public void PR03() {
		PO_HomeView.goToRegister(driver);
		// Too short name
		PO_RegisterView.fillForm(driver, "Lopen", "Bridge 4", "lopen@bridge4.com", "12345678", "abcdefgh");
		PO_RegisterView.checkElement(driver, "class", "alert");			
	}
	
	/**
	 * PR04 - User registry with invalid data, email already used
	 */
	@Test
	public void PR04() {
		PO_HomeView.goToRegister(driver);
		// Too short name
		PO_RegisterView.fillForm(driver, "Dalinar", "Kholin", "dalinar@kholin.com", "12345678", "12345678");
		PO_RegisterView.checkElement(driver, "class", "alert");		
	}
	
	//PR05. Sin hacer /
	@Test
	public void PR05() {
		assertTrue("PR05 sin hacer", false);			
	}
	
	//PR06. Sin hacer /
	@Test
	public void PR06() {
		assertTrue("PR06 sin hacer", false);			
	}
	
	//PR07. Sin hacer /
	@Test
	public void PR07() {
		assertTrue("PR07 sin hacer", false);			
	}	
	
	//PR08. Sin hacer /
	@Test
	public void PR08() {
		assertTrue("PR08 sin hacer", false);			
	}	
	
	//PR09. Sin hacer /
	@Test
	public void PR09() {
		assertTrue("PR09 sin hacer", false);			
	}	
	//PR10. Sin hacer /
	@Test
	public void PR10() {
		assertTrue("PR10 sin hacer", false);			
	}	
	
	//PR11. Sin hacer /
	@Test
	public void PR11() {
		assertTrue("PR11 sin hacer", false);			
	}	
	
	//PR12. Sin hacer /
	@Test
	public void PR12() {
		assertTrue("PR12 sin hacer", false);			
	}	
	
	//PR13. Sin hacer /
	@Test
	public void PR13() {
		assertTrue("PR13 sin hacer", false);			
	}	
	
	//PR14. Sin hacer /
	@Test
	public void PR14() {
		assertTrue("PR14 sin hacer", false);			
	}	
	
	//PR15. Sin hacer /
	@Test
	public void PR15() {
		assertTrue("PR15 sin hacer", false);			
	}	
	
	//PR16. Sin hacer /
	@Test
	public void PR16() {
		assertTrue("PR16 sin hacer", false);			
	}	
	
	//PR017. Sin hacer /
	@Test
	public void PR17() {
		assertTrue("PR17 sin hacer", false);			
	}	
	
	//PR18. Sin hacer /
	@Test
	public void PR18() {
		assertTrue("PR18 sin hacer", false);			
	}	
	
	//PR19. Sin hacer /
	@Test
	public void PR19() {
		assertTrue("PR19 sin hacer", false);			
	}	
	
	//P20. Sin hacer /
	@Test
	public void PR20() {
		assertTrue("PR20 sin hacer", false);			
	}	
	
	//PR21. Sin hacer /
	@Test
	public void PR21() {
		assertTrue("PR21 sin hacer", false);			
	}	
	
	//PR22. Sin hacer /
	@Test
	public void PR22() {
		assertTrue("PR22 sin hacer", false);			
	}	
	
	//PR23. Sin hacer /
	@Test
	public void PR23() {
		assertTrue("PR23 sin hacer", false);			
	}	
	
	//PR24. Sin hacer /
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);			
	}	
	//PR25. Sin hacer /
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);			
	}	
	
	//PR26. Sin hacer /
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);			
	}	
	
	//PR27. Sin hacer /
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);			
	}	
	
	//PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);			
	}

	//PR030. Sin hacer /
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);			
	}
	
	//PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);			
	}
	
		
}

