// Simple KWin script that prints to the console
print("Hello World from KWin!");

// Optional: Register a shortcut to trigger an action
registerShortcut("Hello World Shortcut", "Hello World description", "Meta+H", function() {
    print("main.js: shortcut triggered! NICE!! and then reflected any changes");
});

