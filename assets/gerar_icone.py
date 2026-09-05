from PIL import Image, ImageDraw

TAMANHO = 1024
imagem = Image.new("RGBA", (TAMANHO, TAMANHO), (0, 0, 0, 0))
desenho = ImageDraw.Draw(imagem)

# Fundo arredondado, com camadas para dar profundidade.
desenho.rounded_rectangle((32, 32, 992, 992), radius=230, fill="#4b399f")
desenho.rounded_rectangle((45, 38, 979, 955), radius=218, fill="#6553c5")

# Livro aberto.
esquerda = [(155, 270), (270, 255), (400, 285), (512, 360), (512, 835),
            (410, 765), (285, 735), (155, 755)]
direita = [(869, 270), (754, 255), (624, 285), (512, 360), (512, 835),
           (614, 765), (739, 735), (869, 755)]
desenho.polygon(esquerda, fill="#ffffff", outline="#302477", width=34)
desenho.polygon(direita, fill="#f3efff", outline="#302477", width=34)
desenho.line((512, 360, 512, 835), fill="#302477", width=34)

# Linhas das páginas.
for y in (405, 525, 645):
    desenho.line((245, y, 410, y + 26), fill="#8d7dde", width=27)
    desenho.line((779, y, 614, y + 26), fill="#8d7dde", width=27)

# Pequena estrela dourada: personalidade sem atrapalhar a leitura.
estrela = [(817, 115), (835, 161), (882, 179), (835, 197),
           (817, 244), (799, 197), (752, 179), (799, 161)]
desenho.polygon(estrela, fill="#ffd58d")

imagem.save(
    "assets/icone_biblioteca.ico",
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64),
           (128, 128), (256, 256)],
)
imagem.resize((512, 512), Image.Resampling.LANCZOS).save("assets/icone_biblioteca.png")
