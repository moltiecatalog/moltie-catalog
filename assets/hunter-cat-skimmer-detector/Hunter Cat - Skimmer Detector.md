# Hunter Cat - Skimmer Detector

Original Price: EUR 149
Discounted Price: EUR 125
## How Hunter Cat Works
Hunter Cat works by detecting the number of magnetic stripe heads inside the card reader. Providing information to the user via LEDs on the same Hunter Cat board. The scanning process is simple. The user just has to insert and remove the Hunter Cat normally before inserting the bank card. The Hunter will take a second to process the information and give the read status with three different LEDs: Ok, Warning, and Dangerous. With this information, the user may or may not continue depending on the alert LEDs.
Hardware
The Hunter Cat runs over a microcontroller with a CR2032 3V battery.
The Hunter Cat board design has the same dimensions of a bank card. The only difference is that the Hunter Cat board is a little bit longer. The position of the magstripe hunters are in the same position of a normal magnetic stripe. The design follows the most important physical characteristics of ISO 7810/7816 for positioning. The Hunter Cat has four small pieces of metal in the front side. Those will be useful to interact with the sensors at some ATMs that detect the chip metal as trigger to open the compartment to insert the card.
The position of the magstripe triggers and the pieces of metal in the front side of the board will not affect the ATM reader or magstripe reader functionality. The pieces of metal that act as chip trigger to trick the ATM sensor are NOT connected to any voltage or signal to avoid any issues internally.
Understanding the Hunter Cat and its LEDs
Hunter Cat works detecting the quantity of magnetic stripe heads inside the card reader. The scan process is simple. Before inserting the bank card, the user just has to insert and remove the Hunter Cat like it was a normal card. The Hunter Cat will take a second to process the information and giving the reading results with three LEDs on the same board: Ok, Warning or Dangerous. With this information, the user could proceed or not, depending on the alert LED.
When the user inserts the battery for the first time, the three LEDs on the board will flash together four times. This indicates that Hunter Cat is ready to interact with magstripe readers. 
If the Hunter Cat is not used in a lapse of 15 seconds, it will change from ready mode to sleep mode to save battery. When this transition occurs, the LEDs will flash separately one by one two times.
After the Hunter Cat is in sleep mode, the only way to wake it up is pressing the reset button or removing and inserting the battery. With this process, the Hunter Cat will be ready again to process more magstripe readings.
Note: If the user inserts and remove the Hunter Cat in a magstripe card reader, and the board does not flash any LED that means that none readers was detected at all.
Reading Process
After pressing the reset button or after inserting the battery, the LEDs will flash four times simultaneously, and the Hunter Cat will be ready to interact with magstripe readers. Inserting and removing the Hunter Cat is a normal process like using a normal card. This process takes less than a second to be completed.
The question is why the Hunter Cat has to be inserted and removed in a second or less? This will avoid that the ATM intersect the card and take it all the way into the ATM. Also as preventive mechanism, the Hunter Cat is longer in size that the normal card; adding that the battery holder could block this process as well.
Another important reason to insert and remove the Hunter Cat in less than a second is because the firmware calculates an average reading in one way and confirming on the way back. This gives a better and more accurate reading.
## ⚠ Battery Voltage Considerations:
The Hunter Cat may occasionally fail to function properly if the battery voltage drops to 2.85V. In such cases, the LEDs will remain on, and the device will not respond to pressing the reset button. To resolve this issue, the battery needs to be replaced to restore normal functionality.
 