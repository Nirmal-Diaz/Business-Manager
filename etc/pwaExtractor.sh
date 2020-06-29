rm -r "/home/assassino/Cloud/Archives/Web/Progressive Web Apps/LiveWall + Musix/public";
rm -r "/home/assassino/Cloud/Archives/Web/Progressive Web Apps/LiveWall + Musix/src";
cp -r "../public" "../src" "/home/assassino/Cloud/Archives/Web/Progressive Web Apps/LiveWall + Musix";
cd "/home/assassino/Cloud/Archives/Web/Progressive Web Apps/LiveWall + Musix";
rm -r "./src/controllers" "./src/entities" "./src/repositories" "./src/registries/main" "./src/routers/main";
rm -r "./public/images/main" "./public/layouts/main" "./public/scripts/main" "./public/stylesheets/main";