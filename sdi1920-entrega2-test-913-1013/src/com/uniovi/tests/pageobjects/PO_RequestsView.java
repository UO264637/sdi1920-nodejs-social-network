package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class PO_RequestsView extends PO_TableView {

	
	/**
	 * Clicks the Add friend button of the specified user
	 * @param driver
	 * @param user		Name of the user to send the request
	 */
	public static void acceptFrienRequest(WebDriver driver, String user) {
		By button = By.xpath("//td[contains(text(), '" + user + "')]/following-sibling::*[3]");
		driver.findElement(button).click();
	}

}