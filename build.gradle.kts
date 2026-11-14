plugins {
	java
	id("org.springframework.boot") version "4.1.2"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "wtf.tulahack"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	compileOnly("org.projectlombok:lombok:1.18.48")
	annotationProcessor("org.projectlombok:lombok:1.18.48")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
