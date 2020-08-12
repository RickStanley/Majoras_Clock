# Majora's Clock

Basically a simple Electron app that rewinds the feeling of the game: "The Legend of Zelda™: Majora's Mask". Made by Nintendo®.

## Getting started
``` bash
$ git clone https://github.com/RickStanley/Majoras_Clock.git
$ cd Majoras_Clock
$ npm install
$ npm start
```

## Details

This project pretty much is a lab for testing interoperability. The goal, aside from the fun, is to create an interchangeble application to test desktop/embed platform frameworks by zoning some parts of the code where is plataform/runtime specific, in the main branch case is Electron & NodeJs.

I try to encapsulate most of the components and remove runtime specific calls/operations.

Unfortunately, I made a mistake on 30/10/2019 by migrating all the assets from the core project into another folder where I started a repository anew and with a fresh generated template from [Electron Forge](https://www.electronforge.io/), but I forgot to copy the .git folder to this one, resulting in the overwrite of the original history log. Though the [original repository](https://github.com/Mozz4rt/MAJORAS_TIME) is still up, I've made very signifcant changes from that basis. ¯\_(ツ)_/

## TODO

- [x] Clean up unused assets
- [ ] Add more options:
  - [ ] Smart detecion (prevent showing up if playing, listening to something important, etc)
  - [ ] Priority
- [ ] Live preview on some options change
- [ ] Installation process
- [ ] Update process
- [ ] Locale should also cover settings modal
- [ ] Change clock loop to timeout
- [x] Final hours detection (see todo notes in `.js` files)

## Gallery

**These images are outdated. (10/08/2020)**

### Launcher
![alt text](https://github.com/RickStanley/Majoras_Clock/blob/master/gifs/mj-launch.gif "Launcher")

### Menu
![alt text](https://github.com/RickStanley/Majoras_Clock/blob/master/gifs/trayMenu.gif "Tray Menu")

### Settings
![alt text](https://github.com/RickStanley/Majoras_Clock/blob/master/gifs/Settings.gif "Settings")

### Clock
![alt text](https://github.com/RickStanley/Majoras_Clock/blob/master/gifs/clock.gif "Clock")

### Dawn of A New Day
![alt text](https://github.com/RickStanley/Majoras_Clock/blob/master/gifs/DawnOf.gif "Dawn of -")