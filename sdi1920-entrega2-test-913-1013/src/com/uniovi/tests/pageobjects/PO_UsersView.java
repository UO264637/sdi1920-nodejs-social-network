package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_UsersView extends PO_TableView {
	
	/**
	 * Types the search in the field and submits it
	 * @param driver
	 * @param search	String to search
	 */
	public static void search(WebDriver driver, String search) {
		WebElement email = driver.findElement(By.name("search"));
		email.click();
		email.clear();
		email.sendKeys(search);
		By boton = By.id("searchBtn");
		driver.findElement(boton).click();
	}
	
	/**
	 * Clicks the Add friend button of the specified user
	 * @param driver
	 * @param user		Email of the user to send the request
	 */
	public static void sendFrienRequest(WebDriver driver, String user) {
		By button = By.xpath("//td[contains(text(), '" + user + "')]/following-sibling::*[2]");
		driver.findElement(button).click();
	}

}