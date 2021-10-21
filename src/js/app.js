const jDocument = $(document);
const form = document.querySelector('#form');
const newTaskInput = document.querySelector('#newTask');
const templateAddTask = document.querySelector('#template-add-task').content;
const fragmentAddTask = document.createDocumentFragment();
const btnAddTask = document.querySelector('#btnAddTask');
const taskList = document.querySelector('#taskList');
const dropDownMenu = document.querySelector('#dropDownMenu');
const mobileMenu = document.querySelector('#mobileMenu');
const templateSimpleTask = document.querySelector('#template-task').content;
const fragmentSimpleTask = document.createDocumentFragment();
const templateAddUser = document.querySelector('#template-add-user').content;
const bookControl = document.querySelector('#bookControl');


let userCollection = [];
let taskCollection = {};

let taskBookCollection = [];

let currentBookPage = {};

//Events
form.addEventListener('submit', e => {
    e.preventDefault();
    setTask(e, true);
})


bookControl.addEventListener('click', e => {
    btnAction(e);
})

taskList.addEventListener('click', e => {
    btnAction(e);
})

dropDownMenu.addEventListener('click', e => {
    btnAction(e);
})

mobileMenu.addEventListener('click', e => {
    console.log(e.target)
    btnAction(e);
});

btnAddTask.addEventListener('click', e => {
    btnAction(e);
});

//Functions
const writeBook = () => {
    localStorage.setItem('book', JSON.stringify(taskBookCollection));
    let pointer = document.querySelector('#bookPointer');
    let back = document.querySelector('.fa-backward');
    let forward = document.querySelector('.fa-forward');
    if (taskBookCollection.length > 0) {
        if (!currentBookPage) {
            currentBookPage = taskBookCollection.at(-1);
        }
        let currentIndex = taskBookCollection.indexOf(currentBookPage);
        pointer.textContent = currentBookPage.bookName;
        writeTask();
    }
}

const getRecommendedUser = () => {
    //Calculate all task time
    let allTaskTime = 0;
    let allUserTime = 0;
    let stadistics = [];
    currentBookPage.userCollection.forEach(user => {
        allUserTime += (user.availability) ? Number(user.availability) : 0; //OK
    });

    Object.values(currentBookPage.taskCollection).forEach(task => {
        allTaskTime += Number(task.time);
    }); //OK

    currentBookPage.userCollection.forEach(user => {
        let totalAvailability = Number(user.availability);
        let recommendedPercentage = totalAvailability * 100 / allUserTime;
        console.log(recommendedPercentage);

        let taskUser;
        let spentTime = 0;
        if (currentBookPage.taskCollection) {
            taskArr = Object.values(currentBookPage.taskCollection);
            for (let task of taskArr) {
                if (task.user) {
                    if (task.user.username === user.username) {
                        spentTime += Number(task.time);
                    }
                }

            }
            let spendPercentage = spentTime * 100 / allUserTime;
            let rate = recommendedPercentage - spendPercentage;
            let data = {
                user: user,
                totalAvailability: totalAvailability,
                recommendedPercentage: recommendedPercentage,
                spentTime: spentTime,
                spentTimePercentage: spendPercentage,
                rate: rate
            }
            stadistics.push(data);
        }
    });

    console.log(stadistics);
    stadistics.sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
    return stadistics[0].user;

}

const writeUser = (div) => {
    localStorage.setItem('book', JSON.stringify(taskBookCollection));
    div.querySelector('#userList').innerHTML = '';
    currentBookPage.userCollection.forEach((user) => {
        const templateUser = div.querySelector('#template-user').content; //Not working here
        const clone = templateUser.cloneNode(true);
        clone.querySelector('b').textContent = user.username;
        clone.querySelector('.time').textContent = user.availability + " h";
        clone.querySelectorAll('.fa')[0].dataset.username = user.username;
        div.querySelector('#userList').appendChild(clone);
    });
}

const writeTask = () => {

    orderTaskByStatus();
    localStorage.setItem('book', JSON.stringify(taskBookCollection));
    taskList.innerHTML = '';
    if (currentBookPage.taskCollection) {
        if (Object.values(currentBookPage.taskCollection).length === 0) {
            taskList.innerHTML = `
        <div class="alert alert-dark">
            No pending tasks &#128525;
        </div>
        `;
            return;
        }
        Object.values(currentBookPage.taskCollection).forEach((task) => {
            //Rule with template
            const clone = templateSimpleTask.cloneNode(true);

            if (task.user) {
                clone.querySelector('.username').textContent = task.user.username;
            }
            if (task.dateTask) {
                clone.querySelector('.taskDate').textContent = task.dateTask;
            }
            if (task.time > 0) {
                clone.querySelector('.taskTime').textContent = task.time + "h";
            }

            if (task.status) {
                clone.querySelector('.alert').classList.replace('alert-warning', 'bg-green');
                clone.querySelectorAll('.fa')[0].classList.replace('fa-check-circle', 'fa-undo-alt');
                clone.querySelector('p').style.textDecoration = 'line-through';
            }
            clone.querySelectorAll('.fa')[0].dataset.id = task.id;
            clone.querySelectorAll('.fa')[1].dataset.id = task.id;
            clone.querySelector('p').textContent = task.text;
            clone.querySelector('p').dataset.id = task.id;
            clone.querySelector('p').addEventListener('click', e => {
                btnAction(e);
            });

            fragmentSimpleTask.appendChild(clone);
        });
        taskList.appendChild(fragmentSimpleTask);
    } else {
        createInitialPage();
    }

}

const btnAction = (e) => {
    //Actions nav launchers
    if (e.target.classList.contains('fa-user') || e.target.parentElement.id.includes('user-launcher')) {

        let div = document.createElement('div');
        const clone = templateAddUser.cloneNode(true);
        div.appendChild(clone);

        console.log(div);

        writeUser(div);

        Swal.fire({
            html: div.outerHTML,
            showConfirmButton: false
        });
        jDocument.on('click', `div ${div.id}`, function (e) {
            btnAction(e);
        });
        $('#btnCloseUser').bind('click', function () {
            Swal.close();
        });


    }
    if (e.target.classList.contains('fa-clone') || e.target.parentElement.id.includes('clone-launcher')) {
        Swal.fire({
            showConfirmButton: false,
            html: `
           <div>
           <span><b>Enter a new name for your copy:</b> </span>
           <div>          
             <div class="form-floating p-1 mt-3">
               <input id="bookPageName" type="text" class="form-control my-input" id="floatingInputValue" placeholder="Page name" autofocus="autofocus">
               <label for="floatingInputValue">Page name</label>     
                <div class="d-grid gap-2 mt-3">
                 <button id="btnSaveTask" class="purple" type="submit">SAVE</button>
                </div>             
             </div>
            </div> `
        });
        $('#btnSaveTask').bind('click', function () {
            let newPage = Object.assign({}, currentBookPage);
            let bookName = document.querySelector('#bookPageName').value;
            if (bookName.length > 0) {
                newPage['bookName'] = bookName;
                taskBookCollection.push(newPage);
                currentBookPage = newPage;
                writeBook();
                Swal.close();
            }
        });
    }
    if (e.target.classList.contains('fa-plus-square') || e.target.parentElement.id.includes('new-template-launcher')) {
        //TODO move to templates
        Swal.fire({
            showConfirmButton: false,
            html: `
           <div>
           <span><b>Enter page name:</b> </span>
           <div>          
             <div class="form-floating mt-3 p-1">
               <input id="bookPageName" type="text" class="form-control my-input" id="floatingInputValue" placeholder="Page name" autofocus="autofocus">
               <label for="floatingInputValue">Page name</label> 
                <div class="d-grid gap-2 mt-3">
                 <button id="btnSaveTask" class="purple" type="submit">SAVE</button>
                </div>                                
             </div>
            </div> `
        });

        $('#btnSaveTask').bind('click', function () {
            let bookName = document.querySelector('#bookPageName').value;
            if (bookName.length > 0) {
                let newPage = {
                    bookName: bookName,
                    taskCollection: {},
                    userCollection: [],

                }
                taskBookCollection.push(newPage);
                currentBookPage = newPage;
                writeBook();
                Swal.close();
            }
        });
    }
    if (e.target.classList.contains('fa-trash') || e.target.parentElement.id.includes('delete-task-launcher')) {
        //TODO move to templates
        let html = `<div class="mb-3"><b>Do you want to delete the current page?</b></div>
                    <button id="btnDeletePage" class="purple mb-0" type="submit">DELETE</button>
                    <button id="btnCloseDeletePage" class="pink" type="submit">CLOSE</button>`;
        Swal.fire({
            text: 'Do you want to delete the current task?',
            html: html,
            showCancelButton: false,
            showConfirmButton: false
        });

        //TODOOO
        $('#btnDeletePage').bind('click', function () {
            let index = taskBookCollection.indexOf(currentBookPage);
            taskBookCollection.splice(index, 1);
            writeBook();
            if (taskBookCollection.length === 0) {
                Swal.close();
                createInitialPage();
            }else{
                if(taskBookCollection[index - 1]){
                    currentBookPage = taskBookCollection[index - 1]
                }else if(taskBookCollection[index + 1]){
                    currentBookPage = taskBookCollection[index + 1];
                }
                Swal.close();
            }


        });
        $('#btnCloseDeletePage').bind('click', function () {
            Swal.close();
        });
    }

    //Actions for book
    if (e.target.classList.contains('fa-backward')) {
        let newIndex = taskBookCollection.indexOf(currentBookPage) - 1;
        currentBookPage = taskBookCollection[newIndex];
        writeBook();
    }
    if (e.target.classList.contains('fa-forward')) {
        let newIndex = taskBookCollection.indexOf(currentBookPage) + 1;
        currentBookPage = taskBookCollection[newIndex];
        if (!currentBookPage) {
            currentBookPage = taskBookCollection[0];
        }
        writeBook();
    }

    console.log(e.target);

    //Actions for task
    if (e.currentTarget.id === 'btnAddTask' || e.target.classList.contains('taskContent')) {
        let div = document.createElement('div');
        const clone = templateAddTask.cloneNode(true);
        let select = clone.querySelector('#assignation');
        let optionAuto = document.createElement('option');
        let taskId;
        optionAuto.value = "Auto";
        optionAuto.textContent = "Auto";
        select.appendChild(optionAuto);
        currentBookPage.userCollection.forEach(user => {
            let option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            select.appendChild(option);
        });

        fragmentAddTask.appendChild(clone);
        div.appendChild(fragmentAddTask);


        Swal.fire({
            html: div.outerHTML,
            showConfirmButton: false
        });

        if (e.target.dataset.id) {
            taskId = currentBookPage.taskCollection[e.target.dataset.id].id;
            let task = currentBookPage.taskCollection[e.target.dataset.id];
            document.querySelector('#taskContentArea').value = task.text ? task.text : "";
            document.querySelector('#startDate').valueAsDate = task.dateTask ? new Date(task.dateTaskMillis) : "";
            document.querySelector('#assignation').value = task.user ? task.user.username : "";
            document.querySelector('#taskDuration').value = task.time ? task.time : 0;
        }

        // $(document).on('click', '#btnSaveTask', function () {
        $('#btnSaveTask').bind('click', function () {
            let taskContent = document.querySelector('#taskContentArea').value;
            let startDate = document.querySelector('#startDate').value;
            let assignee = document.querySelector('#assignation').value
            let duration = document.querySelector('#taskDuration').value;
            let formattedDate;
            if (startDate.length > 0) {
                const pad2 = (n) => {
                    return (n < 10 ? '0' : '') + n;
                }
                let date = new Date(startDate);
                let month = pad2(date.getMonth() + 1);
                let day = pad2(date.getDate());
                let year = date.getFullYear();
                formattedDate = day + "/" + month + "/" + year;
                startDate = date;
            }

            let user = null;

            if (assignee === 'Auto') {
                user = getRecommendedUser();
            } else if (assignee.length > 0) {
                let username = assignee;
                user = currentBookPage.userCollection.filter(item => item.username === username)[0];
            }

            if (taskContent.length > 0) {
                let task = {
                    id: taskId ? taskId : Date.now(),
                    text: taskContent,
                    status: false,
                    time: duration > 0 ? duration : 0,
                    user: user,
                    dateTask: formattedDate ? formattedDate : null,
                    dateTaskMillis: startDate ? startDate.getTime() : 0
                };
                currentBookPage.taskCollection[task.id] = task;
                writeTask();
                e.preventDefault();
                Swal.close();
            }
        })

    }
    if (e.target.classList.contains('fa-check-circle')) {
        currentBookPage.taskCollection[e.target.dataset.id].status = true;
        writeTask();
    }
    if (e.target.classList.contains('fa-minus-circle')) {
        delete currentBookPage.taskCollection[e.target.dataset.id];
        writeTask();
    }
    if (e.target.classList.contains('fa-undo-alt')) {
        currentBookPage.taskCollection[e.target.dataset.id].status = false;
        writeTask();
    }

    //Actions for users
    if (e.target.id.includes('btnSaveUser')) {
        // let userControl = document.querySelector("#userControl");
        let inputUserName = document.querySelector("#usernameInput");
        let inputTime = document.querySelector("#timeUserInput");
        if (inputUserName.value.length > 0) {
            let newUserName = inputUserName.value;
            let exist = currentBookPage.userCollection.filter(item => item.username === newUserName);
            if (exist.length > 0) {
                inputUserName.value = "";
                inputTime.value = "";
                alert("User already exist!");
            } else {
                let user = {
                    username: newUserName,
                    availability: inputTime.value > 0 ? inputTime.value : 0
                }
                currentBookPage.userCollection.push(user);
                let div = document.querySelector('#userControl').parentNode;
                inputUserName.value = "";
                inputTime.value = "";
                writeUser(div);
            }

        }
    }
    if (e.target.classList.contains('fa-user-slash')) {
        currentBookPage.userCollection = currentBookPage.userCollection.filter(item => item.username !== e.target.dataset.username);
        let div = document.querySelector('#userControl').parentNode;
        writeUser(div);
    }
    e.stopPropagation();
}

const createInitialPage = () => {
    let appTask = document.querySelector('app-container');
    appTask.classList.add('d-none');
    // TODO move to templates
    Swal.fire({
        allowOutsideClick: false,
        showConfirmButton: false,
        html: `
           <div>
           <span><b>Enter a page name:</b> </span>
           <div>
             <div class="form-floating mt-3 mb-3 p-1">
               <input id="bookPageName" type="text" class="form-control my-input" id="floatingInputValue" placeholder="Page name" autofocus="autofocus">
               <label for="floatingInputValue">Page name</label>
                <div class="d-grid gap-2 mt-3">
                 <button id="btnSaveTask" class="purple" type="submit">SAVE</button>
                </div>
             </div>
            </div> `
    });
    $('#btnSaveTask').bind('click', function () {
        let bookName = document.querySelector('#bookPageName').value;
        if (bookName.length > 0) {
            let newPage = {
                bookName: bookName,
                taskCollection: {},
                userCollection: [],

            }
            taskBookCollection.push(newPage);
            currentBookPage = newPage;
            writeBook();
            writeTask();
        }
        appTask.classList.remove('d-none');
        Swal.close();
    });


}

const orderTaskByStatus = () => {
    if (currentBookPage.taskCollection) {
        let collection = Object.values(currentBookPage.taskCollection);
        if (collection.length > 0) {
            collection.sort((a, b) => new Date(a.dateTaskMillis) - new Date(b.dateTaskMillis));
            collection.sort((a, b) => (a.status) - (b.status));
            let sortedCollection = {};
            collection.forEach(task => {
                sortedCollection[task.id] = task;
            })
            currentBookPage.taskCollection = sortedCollection;
        }
    }


}


//Init
const initCode = () => {
    if (localStorage.getItem('book')) {
        taskBookCollection = JSON.parse(localStorage.getItem('book'));
    }
    console.log(taskBookCollection);
    if (taskBookCollection.length > 0) {
        currentBookPage = taskBookCollection.at(-1);
        console.log(currentBookPage);
    }
    writeBook();
    writeTask();
}

const toogle = (e) => {
    e.classList.toggle("active");
}

const onDomInit = () => {
    if (document.readyState !== 'loading') {
        initCode();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            initCode();
        });
    }
}

onDomInit();


