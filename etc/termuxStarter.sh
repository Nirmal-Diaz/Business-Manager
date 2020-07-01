#Sync the project from the SD card
rsync -rt /data/data/com.termux/files/home/storage/external-1/Business\ Manager/ /data/data/com.termux/files/home/Archives/Business\ Manager;

#Start mysql server
mysqld_safe -u root &

#Rebuild database from script
mysql -u root -proot business_manager < /data/data/com.termux/files/home/Archives/Business\ Manager/etc/businessManager.sql;

#Change directory to project root
cd /data/data/com.termux/files/home/Archives/Business\ Manager;

#Start the project
npm start;