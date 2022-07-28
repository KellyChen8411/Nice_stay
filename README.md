# NICE STAY
NICE STAY is an Airbnb-like website where guests can find their ideal accommodation in specific
locations and hosts can rent out their houses to earn income from their property. NICE STAY
enables guests to connect with communities in a more authentic way.

**Website URL:** https://nicestay.life/

**Test Accounts:**

- Guest
  - email: <span>demo_host</span>@test.com
  - password: 123456

- Host
  - email: <span>demo_guest</span>@test.com
  - password: 123456

## Table of content
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Features](#features)
- [Contact](#contact)

## Technologies
### Back-End
- Node.js
- Express
- Linux
- Nginx
- Docker
### Front-End
- HTML
- CSS
- JavaScript + AJAX + jQuery
- jQuery UI
### Cloud Service (AWS)
- Elastic Compute Cloud (EC2)
- Simple Storage Service (S3)
- Relational Database Service (RDS)
- CloudFront
### Database
- MySQL
### WebSocket
- Socket.IO
### Test
- Mocha
- Chai
- Sinon
### CI / CD
- GitHub Actions
### Networking
- HTTP & HTTPS
- Domain Name System
### Others
- Design Pattern: MVC
- Version Control: Git, GitHub, Docker Hub
- Agile: Trello (SCRUM)

## Architecture
### **CI/CD**
![CICD](https://user-images.githubusercontent.com/41458099/181502502-855b030b-857f-436e-a33e-773b684d3a25.png)
### **Back-End System**
![backendSystem](https://user-images.githubusercontent.com/41458099/181502550-05b5779b-9537-409f-98f5-1caff65fe50e.png)

## Database Schema
![dbSchema](https://user-images.githubusercontent.com/41458099/181502399-f277a577-988b-4dbd-a8bb-270827a8d9e9.png)

## Features
### 1. Guest Features
- General and detailed search
  - Search options can be composited flexibly
  - Get six houses per time by paging to accelarate content delivery
 
https://user-images.githubusercontent.com/41458099/181503406-b6a10c25-4c4a-4d8d-80f7-243417511a7a.mp4

- User friendly design to help find ideal accommodation
  - Booking cancellation time will be adjust based on time zone
  - Customized date picker for every house by disabling booked date
  - Displayed nearby services and facilities

https://user-images.githubusercontent.com/41458099/181504850-845ab69d-1338-4c8b-a747-25b6c14e5531.mp4


- Book or cancel accommodation
  - Hosts will get message from guests when their houses are booked or canceled

https://user-images.githubusercontent.com/41458099/181504900-ccee96f1-199f-4589-9715-9f3bc4956c65.mp4

- Leave comments or rating
  - One booking can leave comment only once

https://user-images.githubusercontent.com/41458099/181505529-49b2ab12-cc3f-444d-8b86-34dcdedde66b.mp4

### 2. Host Features
- Create, edit, and delete house
  - Images are stored on AWS S3 
  - When edit or delete, unused images will be deleted on S3 simultaneously
  - House cannot be deleted when there is booking existing

https://user-images.githubusercontent.com/41458099/181506240-65674af6-9643-4066-9246-0c91b3985a6a.mp4

- Blacklist mechanism
  - Guest in blacklist cannot book houses of the host

https://user-images.githubusercontent.com/41458099/181507035-6decb433-1b35-4fa7-bf48-7cb31d82842d.mp4


## Contact
* **Author:** <a href="https://github.com/KellyChen8411" target="_blank">Hsin-Tzu, Chen</a>
* **Email:** kellychen841106@gmail.com


