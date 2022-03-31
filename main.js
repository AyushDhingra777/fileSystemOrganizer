let fs = require("fs")
const { type } = require("os")
let path = require("path")
let types = {
    media: ["mp4", "mkv"],
    archives: ['zip', '7z', 'rar', 'tar', 'gz', 'ar', 'iso', "xz"],
    documents: ['docx', 'doc', 'pdf', 'xlsx', 'xls', 'odt', 'ods', 'odp', 'odg', 'odf', 'txt', 'ps', 'tex'],
    app: ['exe', 'dmg', 'pkg', "deb"]
}
let arr = process.argv.slice(2)   //since first element is path to node and second element is path to executable file,now this array contains command and path
// console.log(arr) //Just to see what command and directoryPath is in the array

let command = arr[0]  //our command will be at 0th index
switch (command) {
    case "organize":
        organizeFn(arr[1])   //our directory path will be at 1st index of array "arr" and it will be used as dirPath
        break;
    case "tree":
        treeFn(arr[1])      //our directory path will be at 1st index of array "arr" and it will be used as dirPath
        break;

    case "help":
        helpFn()   //our directory path will be at 1st index of array "arr" and it will be used as dirPath
        break;
    default:
        console.log("Please input right command");
        break;

}

function organizeFn(dirPath) {
    console.log("Organize command executed", dirPath)   //Just logging the command is execusted(means this fn was called)
    let desPath; //To store destination path which is by joining input path and directory(organize_file) we have to make
    //1) input->directoryPath ->we will be given a path to some directory
    if (dirPath == undefined) { //if the path is not entered by user,default of value of dirPath will be undefined
        console.log("Please enter correct path");
        return;     //path not mentioned so return
    }
    //2)create->organized_files directory->we will have to create a new directory
    else {        //path mentioned
        let pathExist = fs.existsSync(dirPath)      //return boolean if path exist or not   
        if (pathExist) { //path exists
            //2)If path exists==>create->organized_files directory->we will have to create a new directory
            desPath = path.join(dirPath, "organized_file");   //path.join to make the path of desired destination directory which is called organize_files
            if (fs.existsSync(desPath) == false) { //Organized_file doesnt exists=false,means make new directory,if it gives true(fdirectory there),mkdirSync wont be executed
                fs.mkdirSync(desPath);     //now make the directory organized_file
            }
        }
        else {
            console.log("Enter correct Path");
            return;
        }

    }

    organizeHelp(dirPath, desPath)  //(source path from where we want to organize,location where we want to organize)(in our eg-path of(src dir,organized_files))



}
function organizeHelp(src, dest) {
    //3) identify all the files that are there in the input directory,to do that,we have to read it

    let fileNames = fs.readdirSync(src) //return array of all files in src /with extension included
    console.log(fileNames)          //displaying all the files in the source directory in form of array
    //Now we need to know path of all files in order to put them in respected folder and if it is a folder,we dont touch it
    for (i = 0; i < fileNames.length; i++) //going through each file
    {
        let fileAddress = path.join(src, fileNames[i]) //joining the source with the filename,we get the exact path
        //check if it is file or folder
        let isFile = fs.lstatSync(fileAddress).isFile();     //it is a file
        if (isFile) {
            // console.log(fileNames[i])  //printing name if its a file
            let category = getCategory(fileAddress);
            console.log(fileNames[i], "belongs to", category)
            //4) copy/cut files inside the organize_files directory we made ,inside the respective category(media,doc,archive,app)
            sendFiles(fileAddress, dest, category);
        }

    }
}
function sendFiles(srcFilePath, dest, category) {   //path of src file,destination folder(organize_files),category-media,archive etc
    let categoryPath = path.join(dest, category)    //category path created
    if (fs.existsSync(categoryPath) == false) {    //if the category folder doesnt exist,make it,else do nothing
        fs.mkdirSync(categoryPath);
    }
    let file = path.basename(srcFilePath);  //getting file name without the extension,so we use basename
    let destFilePath = path.join(categoryPath, file)
    fs.copyFileSync(srcFilePath, destFilePath); //copying from src to our destination
    fs.unlinkSync(srcFilePath)  //to remove original file
}
function getCategory(fileAddress) {
    let fileExt = path.extname(fileAddress).slice(1)       //it will return extension name with ".",so we slice
    // console.log("FileExtension is", fileExt);
    for (let type in types) { //value of type will be media/archive/document
        let currentTypeArray = types[type]    //types[type] will give array of its values
        for (let i = 0; i < currentTypeArray.length; i++) { //going through every value of array,eg-for media type,we loop through mp4,mkv
            if (fileExt == currentTypeArray[i]) {   //extension matches
                return type;
            }
        }
    }
    //if type not found in the loop,return others
    return "others";
}
function treeFn(dirPath) {
    // let desPath;
    if (dirPath == undefined) { //checking if path is passed

        console.log("Please enter correct Path")
        return;
    } else {
        let doesExist = fs.existsSync(dirPath);
        if (doesExist) {
            treeHelper(dirPath, "");
        } else {

            console.log("Kindly enter the correct path");
            return;
        }
    }
}

function treeHelper(dirPath, indent) {
    // is file or folder
    let isFile = fs.lstatSync(dirPath).isFile();
    if (isFile == true) {   //if it is a file,get its name using basename and print it
        let fileName = path.basename(dirPath);
        console.log(indent + "├──" + fileName);
    } else {    //if it is a folder
        let dirName = path.basename(dirPath)    //getting directory name
        console.log(indent + "└──" + dirName);
        let childrens = fs.readdirSync(dirPath);    //reading all children(sub-folder/files)
        for (let i = 0; i < childrens.length; i++) {
            let childPath = path.join(dirPath, childrens[i]);  //Making child Path
            treeHelper(childPath, indent + "\t");   //recursion
        }
    }


}
function helpFn() {
    console.log(`List of commands
    1)node main.js organize directoryPath
    2)node main.js tree directoryPath
    3)node main.js help 
    `);
}