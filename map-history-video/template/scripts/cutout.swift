// Cut a person out of a photo (transparent PNG) with macOS Vision:  swift scripts/cutout.swift in.jpg out.png
import Vision
import CoreImage
import AppKit
let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1])
guard let ci = CIImage(contentsOf: url) else { fatalError("cannot read \(a[1])") }
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let r = req.results?.first else { fatalError("no subject found") }
let buf = try r.generateMaskedImage(ofInstances: r.allInstances, from: h, croppedToInstancesExtent: false)
let out = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
print("ok", a[2])
