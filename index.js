const fs = require("fs")
const path = require("path")

class Database {
    constructor(file=false) {
        if (file) {
            this.file = path.join(__dirname, file)
        } else {
            this.file = "./oxzof-db/database.json"
        }
    }
    

    async checkFile() {

        const folderPath = path.dirname(this.file);
        await fs.mkdir(folderPath, { recursive: true },async (err) => {
            await fs.writeFile(this.file, JSON.stringify([], null, 2), (err) => {  
            });
        });
        return fs.existsSync(this.file)
    }
    async writeFile(data) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            await fs.promises.writeFile(this.file, jsonData, 'utf8');
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    async readFile() {
        try {
            const data = await fs.promises.readFile(this.file, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.log(e)
            return false;
        }
    }



    async set(key, value) {
        try {
            const check = await this.checkFile()
            if(!check){
                return;
            }
            const data = await this.readFile();
            const datakey = data.find(x => x.key == key)

            if (datakey) {
                const dataIndex = data.findIndex(x => x.key == key);
                data[dataIndex].value = value;
                const write = await this.writeFile(data);
                return write
            } else {
                let obj = {}
                obj.key = key;
                obj.value = value;
                data.push(obj);
                const write = await this.writeFile(data);
                return write
            }
        } catch (e) {
            console.log(e.message)
            return false
        }

    }
    async get(key=null) {
        
        try{
            
            const data = await this.readFile();
            if(!key){
                return data;
            }else{
                const keydata = await data.find(x => x.key == key);
                return keydata?keydata.value:null;
            }

        }catch(e){
            console.log(e.message)
            return false
        }

    }
    async push(key, value) {
        try{
            const data = await this.readFile()
            const keydata = await data.find(x => x.key == key)
            if(!keydata){
                return null;
            }
            if(!Array.isArray(keydata["value"])){
                console.log(`this data value is not array: ${keydata.value}`)
                return false;
            }
            keydata["value"].push(value)
            const dataIndex = await data.findIndex(x => x.key == key);
            data[dataIndex].value = keydata["value"]
            const write = await this.writeFile(data);
            return write
        }catch(e){
            console.log(e.message)
            return false
        }
    }
}
function createInstance(file) {
    const instance = new Database(file);
    return {
        set:instance.set.bind(instance),
        get:instance.get.bind(instance),
        push:instance.push.bind(instance)
    };
  }

module.exports = createInstance