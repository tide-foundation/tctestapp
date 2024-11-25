// Declare tidecloak globally so all functions can access it
let tidecloak;

// Set defaults
var tidecloakUrl = document.getElementById("tidecloak-url").value;
var realm = document.getElementById("realm").value;
var clientId = document.getElementById("client").value;

function initTC(setstate) {
	// console.log("Initing: ", setstate, tidecloakUrl, realm, clientId);
	
	tidecloak = new Keycloak({
	  url: tidecloakUrl,
	  realm: realm,
	  clientId: clientId,
	});
	
	tidecloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
    })
    .then((authenticated) => {
      if (!authenticated) {
        // console.log("user is not authenticated!");
		if (setstate=="preset") {
			// User is not authenticated; show the form
			document.getElementById("tidecloak-form").classList.remove("hidden");
			document.getElementById("buttons-container").classList.add("hidden");
		} else {
			document.getElementById("tidecloak-form").classList.add("hidden");
			document.getElementById("buttons-container").classList.remove("hidden");
		}
      } else {
		// User is authenticated; show logged-in state
		// console.log("user is authenticated!!!");
		
		document.getElementById("tidecloak-form").classList.add("hidden");
		document.getElementById("buttons-container").classList.remove("hidden");
		displayWelcomeMessage();
		document.getElementById("login-button").classList.add("hidden");
		document.getElementById("logout-button").classList.remove("hidden");
        console.log("AccessToken is " + tidecloak.token);
	  }}
	)
    .catch(console.error);
}

// Set up event listeners for buttons when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Load values from localStorage and URL fragment when the page loads
    const foundForm = loadFormValues();
    const foundFrags = loadValuesFromUrlFragment();
	
    // Bind event listeners to buttons by ID
    document.getElementById("save-button").addEventListener("click", function () {
        saveFormValues();
		window.location.replace("/#url="+tidecloakUrl+"&realm="+realm+"&client="+clientId);
    });
    document.getElementById("clear-config-button").addEventListener("click", clearConfig);
    document.getElementById("login-button").addEventListener("click", login);
    document.getElementById("logout-button").addEventListener("click", logout);

    // Initialize tidecloak and check authentication state
	if (foundForm || foundFrags) {
		initTC("postset");
	} else {
		initTC("preset");
	}
});

function login() {
    if (!tidecloak) {
        // console.error('tidecloak has not been initialized');
        return;
    }
	tidecloak.login({ redirectUri: '${window.location.origin}' });
}

function loadValuesFromUrlFragment() {
	var found = false;
    const fragment = window.location.hash.substring(1); // Remove the '#' at the start
    if (fragment) {
        const params = new URLSearchParams(fragment);
        const tidecloakUrlParams = params.get("url");
        const realmParams = params.get("realm");
        const clientIdParams = params.get("client");
    
        if (tidecloakUrlParams) {
           document.getElementById("tidecloak-url").value = tidecloakUrlParams;
		   tidecloakUrl = tidecloakUrlParams;
		   found = true;
        }
        if (realmParams) {
           document.getElementById("realm").value = realmParams;
		   realm = realmParams;
		   found = true;
        }
        if (clientIdParams) {
           document.getElementById("client").value = clientIdParams;
		   clientId = clientIdParams;
		   found = true;
        }
        //console.log("Form values loaded from URL fragment");
    }
	return found;
}

// Function to save form values to localStorage
function saveFormValues() {
    tidecloakUrl = document.getElementById("tidecloak-url").value;
    realm = document.getElementById("realm").value;
    clientId = document.getElementById("client").value;

    localStorage.setItem("tidecloakUrl", tidecloakUrl);
    localStorage.setItem("realm", realm);
    localStorage.setItem("clientId", clientId);

    //console.log("Form values saved to localStorage");
}

// Function to load form values from localStorage
function loadFormValues() {
	var found = false;
    const tidecloakUrlForm = localStorage.getItem("tidecloakUrl");
    const realmForm = localStorage.getItem("realm");
    const clientIdForm = localStorage.getItem("clientId");

    if (tidecloakUrlForm) {
        document.getElementById("tidecloak-url").value = tidecloakUrlForm;
		tidecloakUrl = tidecloakUrlForm;
		found = true;
    }
    if (realmForm) {
        document.getElementById("realm").value = realmForm;
		realm = realmForm;
		found = true;
    }
    if (clientIdForm) {
        document.getElementById("client").value = clientIdForm;
		clientId = clientIdForm;
		found = true;
    }
    // console.log("Form values loaded from localStorage");
	return found;
}

// Function to clear the form values and localStorage
function clearConfig() {
    document.getElementById("tidecloak-form").reset();
    localStorage.removeItem("tidecloakUrl");
    localStorage.removeItem("realm");
    localStorage.removeItem("clientId");
    
    document.getElementById("buttons-container").classList.add("hidden");
    document.getElementById("tidecloak-form").classList.remove("hidden");

    //console.log("Form and localStorage cleared");
}

function logout() {
    if (!tidecloak) {
        // console.error('tidecloak has not been initialized');
        return;
    }

    if (tidecloak.authenticated) {
		tidecloak.logout();
    }
}

function displayWelcomeMessage() {
    tidecloak.loadUserProfile().then(function(profile) {
        document.getElementById('message').textContent = 'Welcome ' + profile.username;
        document.getElementById('logout-button').classList.remove("hidden");
    }).catch(function() {
        //if (process.env.NODE_ENV !== 'production') console.log('Failed to load user profile');
    });
}
