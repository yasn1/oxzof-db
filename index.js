const fs = require("fs");
const path = require("path");
const https = require("https");
const { BSON } = require("bson"); 
const { exec } = require("child_process");

class Database {
    constructor(file=false,options={}) {
        const {logMessages,autoUpdate} = options;
        if(logMessages==true){
            this.logs=true;
        }
        if(autoUpdate==true){
            this.autoUpdate=true;
        }

        const filePath = process.cwd()
        this.packageName = "oxzof-db";
        this.isVersionChecked = false;
        if (file) {
            this.file = path.join(filePath, file);
        } else {
            this.file = path.join(filePath, "./oxzof-db/database.bson");
        }
        this.isWriting = false;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        await this.checkFile();
    }

    

    async checkPackageVersion() {
        if (this.isVersionChecked) return;

        try {
            const localPackageData = JSON.parse(await fs.promises.readFile(path.join(__dirname, "package.json"), "utf8"));
            const localVersion = localPackageData.version;

            const registryUrl = `https://registry.npmjs.org/${this.packageName}`;
            https.get(registryUrl, (response) => {
                let data = "";
                response.on("data", (chunk) => (data += chunk));
                response.on("end", () => {
                    const latestVersion = JSON.parse(data)["dist-tags"].latest;

                    if (localVersion !== latestVersion) {
                        if(this.autoUpdate==true){
                            this.messageLog(
                                "New update available, autoUpdate active. Updating...","warning"
                              );
                            exec(`npm install ${this.packageName}@latest`,(error, stdout, stderr) => {
                                if (error) {
                                  this.messageLog(
                                    error
                                  );
                                  return;
                                }
                            
                                if (stderr) {
                                  this.messageLog(
                                    stderr
                                  );
                                  return;
                                }
                                this.messageLog(
                                    `Module update completed: ${stdout}`
                                  ,"success");
                              });
                        }else{
                            this.messageLog(
                                `The current version is published as ${latestVersion}. Please update the package: npm i oxzof-db@latest`
                            ,"warning");
                        }
                    }
                });
            }).on("error", (err) => {
                this.messageLog("Error in NPM version control: "+ err.message);
            });

            this.isVersionChecked = true;
        } catch (e) {
            this.messageLog("Error during version check: "+e.message);
        }
    }

    async checkFile() {
        const folderPath = path.dirname(this.file);
        await fs.promises.mkdir(folderPath, { recursive: true });
        if (!fs.existsSync(this.file)) {
            const emptyData = BSON.serialize({});
            await fs.promises.writeFile(this.file, emptyData);
        } else {
            const fileData = await fs.promises.readFile(this.file);
            if (fileData.length === 0) {
                const emptyData = BSON.serialize({});
                await fs.promises.writeFile(this.file, emptyData);
            }
        }
        if (!this.file.endsWith('.bson')) {
            this.messageLog("The file extension must be .bson: "+ this.filePath);
            return false;
        }
        return true;
    }

    async writeFile(data) {
        try {
            const bsonData = BSON.serialize(data);
            await fs.promises.writeFile(this.file, bsonData);
            return true;
        } catch (e) {
            this.messageLog(e);
            return false;
        }
    }

    async readFile() {
        try {
            const data = await fs.promises.readFile(this.file);
            if (data.length === 0) {
                return {};
            }
            return BSON.deserialize(data);
        } catch (e) {
            this.messageLog(e);
            return false;
        }
    }
    messageLog(msg,type="error"){
        switch(type){
            case "error":
                if(this.logs){
                    console.warn(`\x1b[31m[oxzof-db] Error: ${msg} \x1b[0m`)
                }
                break;
            case "warning":
                console.warn(`\x1b[33m[oxzof-db] Warning: ${msg} \x1b[0m`)
                break;
            case "success":
                console.warn(`\x1b[32m[oxzof-db] Success: ${msg} \x1b[0m`)
                break;
            default:
                console.warn(`\x1b[31m[oxzof-db] Info: ${msg} \x1b[0m`)
                break;
        }
    }

    async set(key, value) {
        while (this.isWriting) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isWriting = true;
        try {
            await this.checkFile();
            const data = await this.readFile();
            
            if (!data[key]) {
                data[key] = value;
            } else {
                data[key] = value;
            }
            const write = await this.writeFile(data);
            return write?data[key]:false;
        } catch (e) {
            this.messageLog(e.message);
            return false;
        } finally {
            this.isWriting = false;
        }
    }

    async get(key = null) {
        try {
            await this.checkFile();
            const data = await this.readFile();
            if (!key) {
                return undefined;
            } else {
                return data[key] !== undefined ? data[key] : null;
            }
        } catch (e) {
            this.messageLog(e.message);
            return false;
        }
    }

    async all(){
        try{
            await this.checkFile();
            const data = await this.readFile();
            const keys = Object.entries(data).map(([key, value]) => ({ [key]: value }));
            return keys
        }catch(e){
            this.messageLog(e.message);
            return false;
        }
    }
    
    async push(key, value) {
        while (this.isWriting) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isWriting = true;
        try {
            await this.checkFile();
            const data = await this.readFile();
            if (!data[key]) {
                data[key] = [];
            }
            if (!Array.isArray(data[key])) {
                this.messageLog(`This data value is not an array: ${data[key]}`);
                return false;
            }
            if(Array.isArray(value)){
                value.forEach(x => {
                    data[key].push(x)
                })
            }else{
                data[key].push(value);
            }
            await this.writeFile(data);
            return data[key];
        } catch (e) {
            this.messageLog(e.message);
            return false;
        } finally {
            this.isWriting = false;
        }
    }
    async unpushByIndex(key,index){
        while (this.isWriting) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isWriting = true;
        try {
            await this.checkFile();
            const data = await this.readFile();
            if (!data[key]) {
                return undefined;
            }
            if (!Array.isArray(data[key])) {
                this.messageLog(`This data value is not an array: ${data[key]}`);
                return false;
            }
            if(data[key].length<index||index<0){
                this.messageLog("Invalid index number for unpushByIndex() function")
                return false
            }
            if(isNaN(index)){
                this.messageLog("Invalid argument, unpushByIndex() expects a valid index")
                return false
            }
            data[key].splice(index,1)
            await this.writeFile(data);
            return data[key];
        } catch (e) {
            this.messageLog(e.message);
            return false;
        } finally {
            this.isWriting = false;
        }
    }

    async unpush(key,element){
        while (this.isWriting) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isWriting = true;
        try {
            await this.checkFile();
            const data = await this.readFile();
            if (!data[key]) {
                return undefined;
            }
            if (!Array.isArray(data[key])) {
                console.log(`This data value is not an array: ${data[key]}`);
                return false;
            }
            if(Array.isArray(element)){
                element.forEach(x => {
                    data[key] = data[key].filter(xy => xy !== x)
                })
            }else{
                data[key]=data[key].filter(x => x !== element)
            }
            const write = await this.writeFile(data);
            return data[key];
        } catch (e) {
            console.log(e.message);
            return false;
        } finally {
            this.isWriting = false;
        }
    }


    async delete(key) {
        while (this.isWriting) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isWriting = true;
        try {
            await this.checkFile();
            const data = await this.readFile();
            if (!key) {
                this.messageLog("delete() function needs a key!");
                return false;
            }
            if (data.hasOwnProperty(key)) {
                delete data[key];
                await this.writeFile(data);
                return true;
            } else {
                this.messageLog(`delete() function: "${key}" data key is invalid`);
                return false;
            }
        } catch (e) {
            this.messageLog(e.message);
            return false;
        } finally {
            this.isWriting = false;
        }
    }
    async deleteAll() {
        while (this.isWriting) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.isWriting = true;
        try {
            await this.checkFile();
            const emptyData = BSON.serialize({});
            await fs.promises.writeFile(this.file, emptyData);
            return true;
        } catch (e) {
            this.messageLog(e.message);
            return false;
        } finally {
            this.isWriting = false;
        }
    }

    
    
}

function createInstance(file, filePath) {
    const instance = new Database(file, filePath);
    instance.checkPackageVersion();
    return {
        set: instance.set.bind(instance),
        delete: instance.delete.bind(instance),
        deleteAll: instance.deleteAll.bind(instance),
        get: instance.get.bind(instance),
        push: instance.push.bind(instance),
        unpush: instance.unpush.bind(instance),
        unpushByIndex: instance.unpushByIndex.bind(instance),
        all: instance.all.bind(instance)
    };
}

module.exports = createInstance;
