# node-red-contrib-smartnode
this project is a nodejs package for making the nodered support the Smart Device development.
the pacakge require node-red enviroment.

#Note: this package is for **Intel Edison** with Arduino extension board only now!!

# INSTALL
1. install node-red on your Edison board.
   Please see the ref. [here](http://nodered.org/docs/getting-started/installation.html)
2. update your upm/mraa lib on your **Intel Edison** board by the following cmd:
   ``opkg update``

   ``opkg install mraa``
   
   ``opkg install upm``
   
   If your mraa version is  < 0.4.0, please run the following cmd first:
   
   ``opkg remove mraa``
   
3. install smartnode package
   enter the node-red dir, and run:

   ``npm install node-red-contrib-smartnode``


All the sensors reference, please see [here](http://www.makercollider.com/kit/detail?id=32)
