class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formCreateEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.selectAll();
        this.onSubmit();
        this.onEdit();
    }


    onSubmit() {
        this.formCreateEl.addEventListener('submit', e=>{
            e.preventDefault();

            let btn = this.formCreateEl.querySelector('[type=submit]');
            btn.disabled = true;

            let values = this.getValues(this.formCreateEl);
            if (!values) return false;
            this.getPhoto(this.formCreateEl).then(
                (content) => {
                    values.photo = content;
                    values.save().then(user=>{
                        this.addLine(user);
                        this.formCreateEl.reset();
                        btn.disabled = false;
                    });
                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }

    onEdit() {

        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e=>{
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener('submit', e=>{
            e.preventDefault();
            let btn = this.formUpdateEl.querySelector('[type=submit]');
            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);
            let tr = this.tableEl.rows[this.formUpdateEl.dataset.trIndex];
            let oldUser = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, oldUser, values);
            this.getPhoto(this.formUpdateEl).then(
                (content) => {
                    if (!values.photo) result._photo = oldUser._photo
                    else result._photo = content;
                    let user = new User();
                    user.loadFromJSON(result);
                    user.save().then(user=>{
                        this.getTr(user, tr);
                        this.updateCount();
                        this.formUpdateEl.reset();
                        btn.disabled = false;
                        this.showPanelCreate();
                    });
                },
                (e) => {
                    console.error(e);
                }
            );

        })
    }

    getValues(form) {
        let user = {};
        let isValid = true;
        [...form.elements].forEach((field, index)=> {
            if ((['name', 'email', 'password'].indexOf(field.name) > -1) && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }
            if (field.name == 'gender') {
                if  (field.checked) {
                    user[field.name] = field.value;
                }
            } else if((field.name == 'admin')) {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });

        if (isValid)
            return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin);
        else return false;
                
    }

    getPhoto(form) {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            let elements = [...form.elements].filter(item=> {
                if (item.name === 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            };

            if (file) {
                fileReader.readAsDataURL(file); 
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }
        })
    };


    selectAll() {
        User.all().then(data=>{
            data.users.forEach(dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser);
                this.addLine(user);
            });
        });
    }

    addLine(dataUser) {
        let tr = this.getTr(dataUser);
        this.tableEl.appendChild(tr);
        this.updateCount();
    } 

    getTr(dataUser, tr = null) {
        if (tr === null) tr = document.createElement('tr');
        tr.dataset.user = JSON.stringify(dataUser);
        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `; 
        this.addEventTr(tr);
        return tr;
    }
    
    addEventTr(tr) {
        tr.querySelector('.btn-delete').addEventListener('click', ()=>{
            if (confirm('Deseja realmente excluir?')) {
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove().then(data=>{
                    tr.remove();
                    this.updateCount();
                });
            }
        });

        tr.querySelector('.btn-edit').addEventListener('click', ()=>{
            let userJSON = JSON.parse(tr.dataset.user);
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;  //Usado para identificar uma linha ao atualizar dados
            for (name in userJSON) {
                let field = this.formUpdateEl.querySelector('[name='+name.replace('_', '')+']');
                if (field) {
                    switch (field.type) {
                        case 'file' :
                            continue;
                            break;
                        case 'radio':
                            field = this.formUpdateEl.querySelector('[name='+name.replace('_', '')+'][value='+userJSON[name]+']');
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = userJSON[name];
                            break;
                        default:
                            field.value = userJSON[name];
                    }
                }
            }
            this.formUpdateEl.querySelector('.photo').src = userJSON._photo;
            this.showPanelUpdate();
        });
    }


    updateCount() {
        let numberUsers = 0, numberAdmin = 0;
        [...this.tableEl.children].forEach(tr=>{
            numberUsers++;
            if (JSON.parse(tr.dataset.user)._admin) numberAdmin++
        });
        document.getElementById('number-users').innerHTML = numberUsers;
        document.getElementById('number-users-admin').innerHTML = numberAdmin;
   }

   showPanelCreate() {
       document.getElementById('box-user-create').style.display = 'block';
       document.getElementById('box-user-update').style.display = 'none';
   }

   showPanelUpdate() {
        document.getElementById('box-user-create').style.display = 'none';
        document.getElementById('box-user-update').style.display = 'block';
    }

}