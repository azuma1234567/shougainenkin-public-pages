import zipfile, re, sys
from xml.etree import ElementTree as ET
NS={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
def read(path):
    z=zipfile.ZipFile(path)
    ss=[]
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si",NS):
            ss.append("".join(t.text or "" for t in si.iter("{%s}t"%NS["m"])))
    sheets=[n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml",n)]
    out={}
    for sh in sorted(sheets):
        rows=[]
        for row in ET.fromstring(z.read(sh)).iter("{%s}row"%NS["m"]):
            cells={}
            for c in row.findall("m:c",NS):
                ref=c.get("r"); col=re.match(r"[A-Z]+",ref).group(0); v=c.find("m:v",NS); t=c.get("t")
                if v is None: continue
                val=ss[int(v.text)] if t=="s" else v.text
                cells[col]=val
            if cells: rows.append((row.get("r"),cells))
        out[sh]=rows
    return out
def colnum(c):
    n=0
    for ch in c: n=n*26+ord(ch)-64
    return n
path=sys.argv[1]; key=sys.argv[2] if len(sys.argv)>2 else None
for sh,rows in read(path).items():
    for r,cells in rows:
        line=" | ".join(f"{k}={str(v).strip()}" for k,v in sorted(cells.items(),key=lambda kv:colnum(kv[0])))
        if key is None or key in line: print(f"{sh} r{r}: {line[:600]}")
