({
    debug: function (component, message, args) {
        if (component.get("v.isSubBranchGenericBlockDebug")) {
            if (args) {
                console.log(message, args);
            } else {
                console.log(message);
            }
        }
    }
})