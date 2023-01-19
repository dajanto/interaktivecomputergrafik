async function readMeshAsync(filename, callback) {
    let filenames = [filename];
    let result = await new Promise((resolve) => {
        assimpjs().then(
            function(ajs) {
                Promise.all (filenames.map ((file) => fetch (file))).then ((responses) => {
                    return Promise.all (responses.map ((res) => res.arrayBuffer ()));
                }).then ((arrayBuffers) => {
                    // create new file list object, and add the filename
                    let fileList = new ajs.FileList ();
                    fileList.AddFile (filename, new Uint8Array (arrayBuffers[0]));

                    let result = ajs.ConvertFileList (fileList, 'assjson');
                    if (!result.IsSuccess () || result.FileCount () == 0) {
                        console.log("Could not load mesh: " + filename);
                        return null;
                    }

                    // get the result file, and convert to string
                    let resultFile = result.GetFile (0);
                    let jsonContent = new TextDecoder ().decode (resultFile.GetContent ());
                    let resultJson = JSON.parse (jsonContent);

                    // parse the result json
                    resolve(callback(resultJson));
                })
            }
        );
    });

    return result;
}

function readMesh(filename, callback) {
    assimpjs().then(
        function(ajs) {
            Promise.all (filename.map ((file) => fetch (file))).then ((responses) => {
                return Promise.all (responses.map ((res) => res.arrayBuffer ()));
            }).then ((arrayBuffers) => {
                // create new file list object, and add the filename
                let mesh_buffers = []
                for (let k = 0; k < filename.length; ++k) {
                    let fileList = new ajs.FileList ();
                    console.log(filename[k])
                    fileList.AddFile (filename[k], new Uint8Array (arrayBuffers[k]));

                    let result = ajs.ConvertFileList (fileList, 'assjson');
                    if (!result.IsSuccess () || result.FileCount () == 0) {
                        console.log("Could not load mesh: " + filename[k])
                        continue;
                    }
                    mesh_buffers.push(result);
                }

                // get the result file, and convert to string
                let output = []
                for (let i = 0; i < mesh_buffers.length; ++i) {
                    let resultFile = mesh_buffers[i].GetFile (0);
                    let jsonContent = new TextDecoder ().decode (resultFile.GetContent ());
                    let resultJson = JSON.parse (jsonContent);
                    output.push(resultJson);
                }

                // parse the result json
                callback(output);
            })
        }
    );
}
