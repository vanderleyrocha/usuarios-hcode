class User {

    constructor(name, gender, birth, country, email, password, photo, admin) {
		this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

	get id()
	{
		return this._id;
	}

	set id(id)
	{
		this._id = id;
	}

	get name()
	{
		return this._name;
	}

	set name(name)
	{
		this._name = name;
	}

	get gender()
	{
		return this._gender;
	}

	set gender(gender)
	{
		this._gender = gender;
	}

	get birth()
	{
		return this._birth;
	}

	set birth(birth)
	{
		this._birth = birth;
	}

	get country()
	{
		return this._country;
	}

	set country(country)
	{
		this._country = country;
	}

	get email()
	{
		return this._email;
	}

	set email(email)
	{
		this._email = email;
	}

	get password()
	{
		return this._password;
	}

	set password(password)
	{
		this._password = password;
	}

	get photo()
	{
		return this._photo;
	}

	set photo(photo)
	{
		this._photo = photo;
	}

	get admin()
	{
		return this._admin;
	}

	set admin(admin)
	{
		this._admin = admin;
	}
 
	get register()
	{
		return this._register;
	}

	set register(register)
	{
		this._register = register;
	}

	loadFromJSON(json) {
		for (let name in json) {
			switch(name) {
				case '_register' : this[name] = new Date(json[name]); break;
				default : if (name.substring(0, 1) === '_') this[name] = json[name];
			}
			
		}
	}

	static all() {
		return  HttpRequest.get('/users');
    }

	toJSON() {
		let json = {};
		Object.keys(this).forEach(key=>{
			if (this[key] !== undefined) json[key] = this[key];
		});
		return json;
	}

	save() {
		return new Promise((resolve, reject)=>{
			let promise;
			if (this.id) {
				// update
				promise = HttpRequest.put(`/users/${this.id}`, this.toJSON());
			} else {
				// Insert new
				promise = HttpRequest.post(`/users`, this.toJSON());
			}
			promise.then(data=>{
				this.loadFromJSON(data);
				resolve(this);
			}).catch(e=>{
				reject(e);
			});
		});
	}

	remove() {
		return HttpRequest.delete(`/users/${this.id}`);
	}
    
}