import * as fs from "node:fs"

const filePath = "./openapi.json"

console.log("Starting script...")

fs.promises.readFile(filePath)
  .then(data => {
    console.log("File read successfully.")
    const openapiContent = JSON.parse(data)

    const paths = openapiContent.paths
    for (const pathKey of Object.keys(paths)) {
      const pathData = paths[pathKey]
      for (const method of Object.keys(pathData)) {
        const operation = pathData[method]
        if (operation.tags && operation.tags.length > 0) {
          const tag = operation.tags[0]
          const operationId = operation.operationId
          const toRemove = `${tag}-`
          if (operationId.startsWith(toRemove)) {
            const newOperationId = operationId.substring(toRemove.length)
            operation.operationId = newOperationId
          }
        }
      }
    }

    console.log("Writing to file...")
    return fs.promises.writeFile(
      filePath,
      JSON.stringify(openapiContent, null, 2),
    )
  })
  .then(() => {
    console.log("File successfully modified")
    console.log("Script completed.")
  })
  .catch(err => {
    console.error("Error:", err)
  })