package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.*;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_HomeView extends PO_NavView {
	
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


}
