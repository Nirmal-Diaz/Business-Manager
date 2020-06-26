# Business-Manager
The official computer-based information system(CBIS) for the BIT final year project

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
