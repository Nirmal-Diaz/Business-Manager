# Business-Manager
The official computer-based information system(CBIS) for the BIT final year project

# SETUP ON LINUX/WINDOWS

## PREREQUISITES
1. Node.js (Tested on v11.13.0)
2. npm (Tested on v6.7.0)
3. MySQL (Tested on v8.0.15)

## UPDATING DEPENDANCIES
1. Run command "npm install" from the project root
2. Make sure "./node_modules" is created

## CREATING DATABASE
1. Open "./etc/businessManager.mwb" in "MySQL Workbench"
2. Forward engineer the database with the following options
   - Generate drop schema
   - Generate insert queries
3. Make sure the database "business_manager" is created

## EDITING PROJECT STRUCTURE
* The following steps are completely unnecessary if "git" supported empty directories
1. Create "./private" folder

* These steps are only required if you intend to use initial user accounts which are created for testing purposes
* You can fill these directories with media files(.mp3, .jpg etc.) in order to view them within the CBIS
2. Create "./private/1" folder
3. Create "./private/2" folder

## EDITING DATABASE CONNECTION OBJECT
1. Navigate into "./ormconfig.json"
2. Change the properties of the "default" connection object in lines 5,6,7,8

## RUN THE PROJECT
1. Run the "npm start" command from the project root
2. Open any web browser and navigate to "http://localhost:8080"

## LOGGING IN TO THE CBIS
* You must run the project first
1. Click anywhere on the splash screen
2. Enter "Assassino" (Case sensitive) in the "type here..." field on the "Tell us who you are" screen
3. Press "Enter"
4. Mark the pattern according to the dot Configuration: 1, 5, 9
5. You will be automatically logged in

# SETUP ON TERMUX FOR ANDROID
## NOTES
1. "businessManager.sql" file is generated using the MySQL Workbench "Database > Forward Engineer" feature on "businessManager.mwb" file
2. But since "businessManager.sql" is executed on a MariaDB instance inside termux, you have to remove every occurrence of "VISIBLE" keyword in "businessManager.sql" using the "Find and Replace" feature on any text editor

## FIRST TIME TERMUX SETUP
1. termux-setup-storage
2. Copy this project's root directory (ie. Business Manager) to /storage/3ACD-101B/Android/data/com.termux/files on Android
3. pkg install nodejs
4. pkg install mariadb
5. pkg install rsync
6. mysql_install_db
7. mysql
* Now you are inside mysql's CLI

   1. ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password;
   2. ALTER USER 'root'@'localhost' IDENTIFIED BY "root";
   3. CREATE SCHEMA business_manager;
   4. exit

* Now you are back on Linux terminal
8. cd
9. mkdir Archives
10. rsync -rt /data/data/com.termux/files/home/storage/external-1/Business\ Manager/ /data/data/com.termux/files/home/Archives/Business\ Manager
11. cd /data/data/com.termux/files/home/Archives/Business\ Manager;
12. mysqld_safe -u root &
13. mysql -u root -proot business_manager < /data/data/com.termux/files/home/Archives/Business\ Manager/etc/businessManager.sql
14. npm install ts-node
15. npm install
16. npm start

## NEXT TIME
1. sh /data/data/com.termux/files/home/Archives/Business\ Manager/etc/termuxStarter.sh