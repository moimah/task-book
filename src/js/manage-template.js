/*The Main function need to write all scripts hete*/

const mainFunction = function () {
    const scripts = [
        "js/app.js"
    ]
    includeHtmlTemplAndScripts(scripts);
}

var load = false;

/*Bind the templates to current indexHtml*/
async function includeHtmlTemplAndScripts(scriptsArr) {
    loading = true;
    // loading = true;
    // loading = true;
    let z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("b2b-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                    }
                    if (this.status == 404) {
                        elmnt.innerHTML = "Page not found.";
                    }
                    //Here load all scripts after end charge of last template
                    if (true) {
                        let x = document.getElementsByTagName("*")
                        let lastIndex = x.length;
                        for(let j = 0; j < x.length; j++){
                            let element = x[j];
                            let f = element.getAttribute("b2b-include-html") ? element.getAttribute("b2b-include-html") : null;
                            if(f){
                                lastIndex = j;
                            }
                        }
                        if(i === lastIndex){
                            loadScripts(scriptsArr);
                        }
                    }

                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("b2b-include-html");
                    includeHtmlTemplAndScripts(scriptsArr);
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}

/*Load all the scrips*/
let loadScripts = function (scripts) {
    console.log(scripts);
    for (let f of scripts) {
        let script = document.createElement("script");
        script.src = f;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}


mainFunction();


