// Create an object called 'task'
  // Populate the properties based on the provided data model
// Create a function called 'addTask'
  // Give the function input parameters for: name, type, rate, time, client
  // Paste your object definition from above in the function
  // Replace the property values with the input paramaters
  // Add the object to the taskList array

class Task {
  constructor(name ,type, id, date, rate, time, client) {
    this.name = name;
    this.type = type;
    this.id = id;
    this.date = date;
    this.rate = rate;
    this.time = time;
    this.client = client;
  }
}

taskList = [];

function addTask(name, type, rate, time, client) {
  var newTask = new Task(name, type, Date.now(), new Date().toISOString(), rate, time, client);
  taskList.push(newTask);
}

addTask("Initial Sketches", "Concept Ideation", 30, 2, "Google");
addTask("Home page design", "Wireframe Design", 45, 5, "Atlassian");
addTask("Backend dev", "Application Coding", 80, 12, "Windows");
addTask("Database testing", "Testing/Debugging", 60, 15, "Amazon");
addTask("User research", "Pitch deck", 50, 38, "Woolworths");

console.log(taskList);

// Call the function with test values for the input paramaters



// Log the array to the console.
