var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    // Host and user name
    host: 'localhost',
    user: 'root',

    // Your password here
    password: 'stickkiller1',

    // Database and default port
    database: 'bamazon',
    port: 3306
});

// Empty array to send products once loaded to for use in inquirer
var products = [];

function readProducts() {
    connection.query("SELECT * FROM bamazon.products", function (err, res) {
        if (err) throw err;
        console.log("Welcome to Bamazon!")
        // Logs all products from bamazon DB
        console.log("Here is all of our products...\n");
        console.log("-------------------------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log("ID - " + res[i].item_id + " | Product - " + res[i].product_name + " | Price - " + res[i].price);
            products.push(res[i].product_name);
        }
        console.log("-------------------------------------------");
        buyProduct();
    });
};

function buyProduct() {
    inquirer
        .prompt([
            {
                type: "list",
                name: 'product',
                message: "What would you like to buy?",
                choices: products,
            },
            {
                type: 'input',
                name: 'units',
                message: 'How many units of the product they would like to buy?'
            }
        ])
        .then(answers => {
            var item = answers.product;
            var search = "SELECT * FROM products WHERE product_name='" + item + "' LIMIT 1";
            var amt = parseInt(answers.units);

            connection.query(search, function (err, res) {
                if (err) throw err;

                var stock = res[0].stock_quantity;
                var price = res[0].price;
                var total = amt * price;

                if (stock > amt) {
                    updateProduct(item, stock, amt, total);
                }
                else {
                    console.log("Insufficient quantity to Fulfill Order! Try Purchasing Different Amount");
                }

            }); //Connection Query End

        }); //Inquirer THEN Function End
};

function updateProduct(name, x, y, z) {
    var newAmt = x - y;

    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newAmt,
            },
            {
                product_name: name
            }
        ],
        function (err, res) {
            console.log("Thank you for Your Purchase! Total: $" + z);

            connection.end();
        }
    );

}

readProducts();