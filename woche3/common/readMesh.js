
function readMesh(filename, callback) {
    assimpjs().then(
        function(ajs) {
            Promise.all (filename.map ((file) => fetch (file))).then ((responses) => {
                return Promise.all (responses.map ((res) => res.arrayBuffer ()));
            }).then ((arrayBuffers) => {
                // create new file list object, and add the filename
                let fileList = new ajs.FileList ();
                for (let i = 0; i < filename.length; i++) {
                    fileList.AddFile (filename[i], new Uint8Array (arrayBuffers[i]));
                }

                let result = ajs.ConvertFileList (fileList, 'assjson');
                if (!result.IsSuccess () || result.FileCount () == 0) {
                    console.log("Could not load mesh: " + filename)
                    return;
                }

                // get the result file, and convert to string
                let resultFile = result.GetFile (0);
                let jsonContent = new TextDecoder ().decode (resultFile.GetContent ());

                // parse the result json
                let resultJson = JSON.parse (jsonContent);
                callback(resultJson);
                
                //console.log(JSON.stringify (resultJson, null, 4));
            })
        }
    );
}
