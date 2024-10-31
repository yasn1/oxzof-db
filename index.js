const fs = require("fs");
const path = require("path");
const https = require("https");
const { BSON } = require("bson"); 

class Database {
    constructor(file = false) {
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
                        console.warn(
                            `\x1b[31m[oxzof-db] Warning: The current version is published as ${latestVersion}. Please update the package: npm i oxzof-db@latest\x1b[0m`
                        );
                    }
                });
            }).on("error", (err) => {
                console.error("Error in NPM version control:", err.message);
            });

            this.isVersionChecked = true;
        } catch (e) {
            console.error("Error during version check:", e.message);
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
            console.error("The file extension must be .bson: ", this.filePath);
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
            console.log(e);
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
            console.log(e);
            return false;
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
            return write;
        } catch (e) {
            console.log(e.message);
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
            console.log(e.message);
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
            console.log(e.message);
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
                console.log(`This data value is not an array: ${data[key]}`);
                return false;
            }
            if(Array.isArray(value)){
                value.forEach(x => {
                    data[key].push(x)
                })
            }else{
                data[key].push(value);
            }
            const write = await this.writeFile(data);
            return write;
        } catch (e) {
            console.log(e.message);
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
            return write;
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
                console.error("Delete function needs a key!");
                return false;
            }
            if (data.hasOwnProperty(key)) {
                delete data[key];
                await this.writeFile(data);
                return true;
            } else {
                console.error("Data key not found:", key);
                return false;
            }
        } catch (e) {
            console.log(e.message);
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
            console.log(e.message);
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
        all: instance.all.bind(instance)
    };
}

module.exports = createInstance;
