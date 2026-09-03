#!/usr/bin/env python3
import json,sys
from pathlib import Path
from PIL import Image
import numpy as np

def peaks(a, axis):
    dark=a<105
    scan=dark.T if axis==0 else dark
    need=(a.shape[0] if axis==0 else a.shape[1])*.20
    current=np.zeros(scan.shape[0],dtype=np.int16)
    longest=np.zeros(scan.shape[0],dtype=np.int16)
    for offset in range(scan.shape[1]):
        current=(current+1)*scan[:,offset]
        np.maximum(longest,current,out=longest)
    ids=np.where(longest>=need)[0]
    groups=[]
    for x in ids:
        if not groups or x-groups[-1][-1]>2: groups.append([x])
        else: groups[-1].append(x)
    return [round(sum(g)/len(g)) for g in groups if len(g)<=15 and 2<round(sum(g)/len(g))]

def compare(ref,out,crop=None,overlay=None):
    ri=Image.open(ref).convert("L"); oi=Image.open(out).convert("L")
    if crop == "top": ri=ri.crop((0,0,ri.width,ri.height//2))
    elif crop == "bottom": ri=ri.crop((0,ri.height//2,ri.width,ri.height))
    # Both are rendered at 300dpi; crop/resize only when a PDF renderer adds a sub-pixel page edge.
    if ri.size!=oi.size: ri=ri.resize(oi.size)
    if overlay:
        base=Image.merge("RGB",(ri,ri,ri)); rendered=Image.merge("RGB",(oi,oi,oi))
        Image.blend(base,rendered,.5).save(overlay)
    ra=np.asarray(ri); oa=np.asarray(oi)
    results=[]
    for name,axis in (("vertical",0),("horizontal",1)):
        rp,op=peaks(ra,axis),peaks(oa,axis)
        for x in rp:
            if op:
                d=min(abs(x-y) for y in op)
                y=min(op,key=lambda value:abs(x-value));results.append({"axis":name,"referencePx":x,"outputPx":y,"deltaMm":round(abs(x-y)/11.811,3)})
    worst=max((x["deltaMm"] for x in results),default=999)
    return {"reference":str(ref),"output":str(out),"crop":crop,"lineCount":len(results),"maxDeltaMm":round(worst,3),"pass":worst<=1.0,"lines":results}

if __name__=="__main__":
    crop=None;overlay=None
    for arg in sys.argv[3:]:
        if arg.startswith("--crop="): crop=arg.split("=",1)[1]
        elif arg.startswith("--overlay="): overlay=Path(arg.split("=",1)[1])
    print(json.dumps(compare(Path(sys.argv[1]),Path(sys.argv[2]),crop,overlay),ensure_ascii=False))
