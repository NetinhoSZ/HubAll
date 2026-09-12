# Baixar Video

Depende de tres coisas que ficam de fora do git (ver .gitignore) e precisam ser recriadas em qualquer maquina nova:

## 1. venv Python

```
cd tools/download-video
python -m venv venv
./venv/Scripts/python.exe -m pip install -r requirements.txt
./venv/Scripts/python.exe -m pip install bgutil-ytdlp-pot-provider
```

## 2. Node portatil (>=22.12) para o solver de desafios JS do YouTube

O Node do sistema pode ser mais antigo que o exigido pelas dependencias do pot-provider. Baixe um Node LTS standalone e extraia em `tools/download-video/portable-node/` (deve conter `node.exe` na raiz).

## 3. PO Token provider (necessario pra baixar do YouTube sem bloqueio "Sign in to confirm you're not a bot")

```
git clone --depth 1 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git tools/download-video/pot-provider
rm -rf tools/download-video/pot-provider/.git
cd tools/download-video/pot-provider/server
npm install
npx tsc
```

## 4. cookies.txt (sessao logada no YouTube)

O YouTube ainda pode exigir cookies de uma conta logada. Use uma conta secundaria/descartavel, nao a principal — o arquivo exportado equivale a estar logado como essa conta para quem tiver acesso a ele.

1. Loga a conta secundaria no youtube.com num perfil de navegador separado.
2. Exporta os cookies em formato Netscape (ex: extensao "Get cookies.txt LOCALLY").
3. Salva em `tools/download-video/cookies.txt`.

Sem esse arquivo o download de sites sem bloqueio de login (ex: link direto de video) continua funcionando normalmente.
