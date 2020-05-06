package com.uniovi.tests.pageobjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.uniovi.tests.util.SeleniumUtils;
import static org.junit.Assert.assertTrue;

import java.util.List;

public class PO_TableView extends PO_NavView {

	public static void checkUsers(WebDriver driver, String...strings ) {
		// To search for no users we search the absence of @ as all the email require them
		if (strings.length == 0) {
			SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "@", getTimeout()); 
			return;
		}
		// Count the number of users is the same as the expected
		int nusers = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
						getTimeout()).size();
		// Check they are the expected
		assertTrue(nusers == strings.length);
		for (String s: strings)
			checkElement(driver, "text", s);
	}
	
	public static void changePage(WebDriver driver, int page) {
		List<WebElement> elements = PO_View.checkElement(driver, "free", "//a[contains(@class,'page-link')]");
		elements.get(page-1).click();
	}

}