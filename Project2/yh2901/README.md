things I found/changed:

 regarding calling smarty street:   
       1.smarty street responses to HTTPS request only not HTTP  
       2.zipcode was left out of the params   
       3. I moved the entire address validation funciton inside the Handler's switch case, in order to access the https response directly

 regarding error codes:   
       1. I declared all error as functions upfront in the Handler function   
       2. don't forget to JSON.stringify error code objects   
       3. I changed all 422 to 400   

regarding the table schema:  
       1. I recreate the addresses table, and make the key: delivery_point_barcode
