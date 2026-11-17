import PDFKit
import AppKit
let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
for i in 0..<doc.pageCount {
  let p = doc.page(at: i)!
  let img = p.thumbnail(of: NSSize(width: 1240, height: 1754), for: .mediaBox)
  let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "p\(i+1).png"))
}
print(doc.pageCount)
