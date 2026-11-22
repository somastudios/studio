# Junta capturas en hojas de contacto:  python3 -I scripts/hoja.py <carpeta> <columnas> <ancho-celda> <por-hoja>
import sys, glob, os
from PIL import Image
carpeta, cols, w, por = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
fs = sorted(f for f in glob.glob(os.path.join(carpeta, '*.png')) if '/hoja-' not in f)
for k in range(0, len(fs), por):
    lote = fs[k:k+por]
    ims = [Image.open(f).convert('RGB') for f in lote]
    h = int(w * ims[0].height / ims[0].width)
    filas = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (w*cols, h*filas), (40, 40, 40))
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, h)), ((i % cols) * w, (i // cols) * h))
    sh.save(os.path.join(carpeta, f'hoja-{k//por}.png'))
print(len(fs))
