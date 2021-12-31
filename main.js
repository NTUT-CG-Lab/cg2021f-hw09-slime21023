import { threejsViewer } from './jsm/threejsViewer.js'
import { STLExporter } from "./threejs/examples/jsm/exporters/STLExporter.js"
import { 
    MeshPhongMaterial,
    MeshToonMaterial
} from './threejs/build/three.module.js'
const fileRegex = /(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/
const modelView = new threejsViewer(document.body)

const init = () => {
    const closeBtn = document.getElementById('closeBtn')
    const controlPanel = document.getElementById('controlPanel')
    const content = controlPanel.getElementsByClassName('panelContent')[0]
    closeBtn.addEventListener('click', evt => {
        evt.preventDefault()

        if (controlPanel.dataset.collapsed == 'true') {
            content.classList.remove('close')
            content.classList.add('open')
            controlPanel.dataset.collapsed = false
        }
        else {
            content.classList.add('close')
            content.classList.remove('open')
            controlPanel.dataset.collapsed = true
        }
    })

    const [
        rawFile, 
        modelData,
        isovalueCtrl,
        textureConfig,
        // polylineDisplay
    ] = document.getElementsByName('settingForm')

    const isolabel = document.getElementById('isolabel')
    const [ 
        optTexture1, 
        optTexture2 
    ] = [ 
        new MeshPhongMaterial(), 
        new MeshToonMaterial() 
    ]
    rawFile.addEventListener('change', evt => {
        const fr = new FileReader()
        const [ file ] = evt.target.files
        if(!file) return
        
        const { name: filename } = file
        const [ _, width, height, depth, byte ] = filename.split('.')[0].split('_') 
        alert(JSON.stringify({ width, height, depth, byte }))
        const max = Math.max(width, height, depth)

        let paddingData = null

        fr.onload = () => {
            const result = fr.result
            if (byte == 'uint8') {
                paddingData = new Uint8Array(result, 0, max * max * max)
                isolabel.innerText = `閥值: 75/255`
                modelView.loadData(paddingData, max, optTexture1)
            }
        }

        fr.readAsArrayBuffer(file)
    })

    modelData.addEventListener('click', evt => {
        const exporter = new STLExporter()
        const mesh = modelView.download()
        const result = exporter.parse(mesh, { binary: true })
        const blob = new Blob([result.buffer], {type: 'application/octet-stream'})
        const link = document.createElement('a')
        link.download = 'blob.stl'
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
    })
    
    isovalueCtrl.addEventListener('click', evt => {
        const isovalue = evt.srcElement.value
        isolabel.innerText = `閥值: ${isovalue}/255`
        modelView.updateIsolation(isovalue)
    })

    textureConfig.addEventListener('change', evt => {
        const selectedTextureIndex = evt.srcElement.value
        const texture = [optTexture1, optTexture2]
        modelView.updateTexture(texture[selectedTextureIndex])
    })

    // polylineDisplay.addEventListener('change', evt => {})
}

window.onload = init