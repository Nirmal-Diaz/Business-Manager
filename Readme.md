# Business-Manager
The official computer-based information system(CBIS) for the BIT final year project

## PREREQUISITES
1. Node.js (Tested on v11.13.0)
2. npm (Tested on v6.7.0)
3. MySQL (Tested on v8.0.15)

## UPDATING DEPENDANCIES
1. Run command "npm update" from the project root
2. Make sure "./node_modules" is created

## CREATING DATABASE
1. Open "./Business_Manager.mwb" in "MySQL Workbench"
2. Forward engineer the database with the following options
   - Generate drop scemea
   - Generate insert queries
3. Make sure the database "d" is created

## EDITING PROJECT STRUCTURE
* The following steps are completely unnecessaty if "git" supported empty directories
1. Create "./Private" folder

* These steps are only required if you intend to use initial user accounts which are created for testing purposes
* You can fill these directories with media files(.mp3, .jpg etc.) in order to view them within the CBIS
2. Create "./Private/Nirmal Diaz" folder
3. Create "./Private/Sandun Perera" folder

## EDITING DATABASE CONNECTION OBJECT
1. Navigate into "./Scripts/DAO.js"
2. Change the properties of the "connection" object at line 4 to match your MySQL server settings

## RUN THE PROJECT: ELECTRON MODE
* This is a temporary solution. Soon the Business Manager Server and its Electron client will be separated
1. Run command "npm start" from the project root

## RUN THE PROJECT: WEB APP MODE
* This is a temporary solution. Soon the Business Manager Server and its Electron client will be separated
* You must run the project in Electron mode in order to continue
* Do not terminate the electron process. Just minimize the electron window.
1. Open any web browser and navigate to "http://localhost:80"

## LOGGING IN TO THE CBIS
1. Click anywhere on the splash screen
2. Enter "Nirmal Diaz" (Case sensitive) in the "type here..." field on the "Tell us who you are" screen
3. Press "Enter"
4. Mark the pattern according to the dot Configuration: 8, 7, 4, 1, 5, 7, 6, 3, 2
5. You will be automatically logged in
6. Use mouse wheel to scroll through the "stack of module cards"
