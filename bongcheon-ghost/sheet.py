import sys
from PIL import Image
fs=sys.argv[2:]; ims=[Image.open(f'out/stills/s_{f.replace(".","_")}.png') for f in fs]
w,h=ims[0].size; sheet=Image.new('RGB',(w*4,h*((len(ims)+3)//4)))
for i,im in enumerate(ims): sheet.paste(im,((i%4)*w,(i//4)*h))
sheet.save(sys.argv[1])
