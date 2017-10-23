
var data = [];
var newO = {};
var editMode = {
    edit: false,
    editId: undefined
};

var marequete = new XMLHttpRequest();
marequete.open('GET', "http://localhost:3000/api/liste", true);
marequete.send();

marequete.addEventListener("readystatechange", processRequest, false);
function processRequest(event) {
    console.log(event);
    console.log(marequete.readyState);
    console.log(marequete.status);

    if (marequete.readyState == 4 && marequete.status == 200) {
        var mareponseText = marequete.responseText;
        mareponseText = JSON.parse(mareponseText);
        data = mareponseText;
        data.forEach(function(user) {
            bindList(user);

        });
    }

}

var monUl = document.createElement("ul");
monUl.classList.add("list-group")
var monWrap = document.getElementById("wrap");

monWrap.appendChild(monUl);

var monBtn = document.getElementById("addNew");
monBtn.addEventListener("click", function(event) {
    document.getElementById("myForm").classList.toggle("show");

});

function bindList(user) {
    var monLi = document.createElement("li");
    monLi.innerHTML = user.nom + ' ' + user.prenom;
    monLi.classList.add("list-group-item");
    monLi.setAttribute("data-idUser", user._id);
    monLi.setAttribute("data-objUser", JSON.stringify(user));

    addBtnProfile(monLi);
    addBtnDelete(monLi);
    addBtnEdit(monLi);

    monUl.appendChild(monLi);
}


// add buttons
function addBtnProfile(elem) {
    var btnProfile = document.createElement("span");
    btnProfile.classList.add("badge")
    btnProfile.innerHTML = "<span class='glyphicon glyphicon-user' aria-hidden='true'></span>";
    btnProfile.addEventListener("click", detectClick);
    elem.appendChild(btnProfile);
}

function addBtnDelete(elem) {
    var deleteBtn = document.createElement("span");
    deleteBtn.classList.add("badge")
    deleteBtn.innerHTML = "<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>";
    deleteBtn.addEventListener("click", deleteUser);
    elem.appendChild(deleteBtn);
}

function addBtnEdit(elem) {
    var deleteEdit = document.createElement("span");
    deleteEdit.classList.add("badge")
    deleteEdit.innerHTML = "<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>";
    deleteEdit.addEventListener("click", editUser);
    elem.appendChild(deleteEdit);
}



// click detection
function detectClick(event) {
    event.preventDefault();
    console.log(event);
    console.log(event.target);
    var myTarget = event.target.parentNode.parentNode;
    console.log(myTarget);
    var userId = myTarget.getAttribute("data-idUser");
    console.log(userId);

    window.location = "./profil" + '#' + myTarget.getAttribute("data-idUser");
}


function submitForm(event) {
    console.log("submitted");

    var monForm = document.getElementById("newUser").elements;
    var newUser = {};

    _.forIn(monForm, function(item) {

        if (item.value) {
                console.log(item.name);

                console.log(item.value);
                newUser[item.name] = item.value;
        }


    });
    if (editMode.edit === false) {
        console.log("je suis en création");

        console.log(newUser);
        var postUser = new XMLHttpRequest();
        postUser.open('POST', "http://localhost:3000/new", true);
        postUser.setRequestHeader("Content-type", "application/json");

        postUser.send(JSON.stringify(newUser));

        postUser.onreadystatechange = function() {
            if (postUser.readyState == XMLHttpRequest.DONE && postUser.status == 200) {
                console.log('req ok');
                console.log(postUser.responseText);
                var addUser = JSON.parse(postUser.responseText);
                var addUser = bindList(addUser);

            }
        }
    }
    else if (editMode.edit === true) {
        console.log("je suis en edition");
        console.log(editMode);
        console.log(newUser);
        newUser._id = editMode.editId;

        var editUser = new XMLHttpRequest();
        editUser.open('PUT', "http://localhost:3000/api/edit/" + editMode.editId, true);
        editUser.setRequestHeader("Content-type", "application/json");

        editUser.send(JSON.stringify(newUser));

        editUser.onreadystatechange = function() {
            if (editUser.readyState == XMLHttpRequest.DONE && editUser.status == 200) {
                console.log('req ok');
                console.log(editUser.responseText);
                var editedUser = JSON.parse(editUser.responseText);
                console.log(editedUser);

            }
        }

    }



};

// delete
function deleteUser(event) {
    event.preventDefault();
    console.log("delete");
    console.log(event);
    console.log(event.target);
    var myTarget = event.target.parentNode.parentNode;
    console.log(myTarget);
    var userId = myTarget.getAttribute("data-iduser");
    console.log(userId)
    var idObj = {
        id: userId
    };


    var deleteUser = new XMLHttpRequest();
    deleteUser.open('POST', "http://localhost:3000/api/delete", true);
    deleteUser.setRequestHeader("Content-type", "application/json");

    deleteUser.send(JSON.stringify(idObj));

    deleteUser.onreadystatechange = function() {
            if (deleteUser.readyState == XMLHttpRequest.DONE && deleteUser.status == 200) {
                console.log('req ok');
                myTarget.remove();

            }
        }

};

// edit
function editUser(event) {
    console.log("edit");

    document.getElementById("myForm").classList.toggle("show");
    var myTarget = event.target.parentNode.parentNode;
    console.log(myTarget);
    var objUser = myTarget.getAttribute("data-objUser");
    editMode.edit = true;
    editMode.editId = myTarget.getAttribute("data-idUser");

    console.log(objUser);
    objUser = JSON.parse(objUser);
    console.log(objUser._id);
    var monForm = document.getElementById("newUser").elements;
    _.forIn(monForm, function(item) {
        item.value = objUser[item.name];
    });



};
