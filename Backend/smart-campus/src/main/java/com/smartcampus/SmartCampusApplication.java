package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartCampusApplication implements Runnable{

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusApplication.class, args);
	}


	@Override
	public void run() {
		
	}
}
