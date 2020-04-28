package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_LoginView extends PO_NavView {

	static public void fillForm(WebDriver driver, String emailp, String passwordp) {
		WebElement email = driver.findElement(By.name("email"));
		email.click();
		email.clear();
		email.sendKeys(emailp);
		WebElement password = driver.findElement(By.name("password"));
		password.click();
		password.clear();
		password.sendKeys(passwordp);
		// Press the submit button.
		By button = By.className("btn");
		driver.findElement(button).click();	
	}
	
	static public void logAs(WebDriver driver, String emailp, String password) {
		fillForm(driver, emailp, password);
		PO_UsersView.checkElement(driver, "id", "tableUsers");
	}

}
