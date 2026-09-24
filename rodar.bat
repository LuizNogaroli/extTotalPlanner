@echo off
setlocal
cd /d "%~dp0"

REM ===========================================================================
REM rodar.bat - servidor de teste local do extPlanner (MANUAL_TECNICO 3.16)
REM Abre o app no navegador comum, sem carregar como extensao. Neste modo o
REM StorageService usa localStorage (dados separados dos da extensao).
REM
REM O servidor Python vai embutido em Base64 (decodificado com powershell) para
REM o .bat continuar sendo um arquivo unico. Codigo-fonte legivel e o motivo de
REM cada decisao: docs/historico/rodar_bat_revisao_20260924_0200.md
REM   - Cache-Control: no-store (evita a armadilha de cache, MANUAL 3.11)
REM   - MIME text/javascript para .js (exigido por <script type=module>)
REM   - uma thread por conexao (thread unica travava a pagina sem carregar o JS)
REM   - porta 8000; se ocupada, usa a proxima livre (sem SO_REUSEADDR)
REM   - escuta so em 127.0.0.1 (nao expoe os arquivos na rede)
REM   - abre o navegador so depois que o servidor esta pronto
REM ===========================================================================

set "SERVER=%TEMP%\extplanner_server.py"
powershell -NoProfile -Command "[IO.File]::WriteAllText('%SERVER%', [Text.Encoding]::ASCII.GetString([Convert]::FromBase64String('aW1wb3J0IGh0dHAuc2VydmVyLCBzb2NrZXQsIHN5cywgd2ViYnJvd3NlcgoKIyBQb3J0YSBpbmljaWFsIChwYWRyYW8gODAwMDsgcG9kZSBzZXIgcGFzc2FkYSBjb21vIGFyZ3VtZW50bykuIFNlIGVzdGl2ZXIgb2N1cGFkYSwgdGVudGEgYXMgc2VndWludGVzLgpQT1JUQV9JTklDSUFMID0gaW50KHN5cy5hcmd2WzFdKSBpZiBsZW4oc3lzLmFyZ3YpID4gMSBlbHNlIDgwMDAKVEVOVEFUSVZBUyA9IDIwCkFCUklSX05BVkVHQURPUiA9ICctLXNlbS1uYXZlZ2Fkb3InIG5vdCBpbiBzeXMuYXJndgoKCmNsYXNzIEhhbmRsZXIoaHR0cC5zZXJ2ZXIuU2ltcGxlSFRUUFJlcXVlc3RIYW5kbGVyKToKICAgICMgbm8tc3RvcmU6IG8gbmF2ZWdhZG9yIG51bmNhIHJlYXByb3ZlaXRhIEpTL0NTUyBhbnRpZ28gKE1BTlVBTF9URUNOSUNPIDMuMTEpCiAgICBkZWYgZW5kX2hlYWRlcnMoc2VsZik6CiAgICAgICAgc2VsZi5zZW5kX2hlYWRlcignQ2FjaGUtQ29udHJvbCcsICduby1zdG9yZSwgbm8tY2FjaGUsIG11c3QtcmV2YWxpZGF0ZSwgbWF4LWFnZT0wJykKICAgICAgICBzZWxmLnNlbmRfaGVhZGVyKCdQcmFnbWEnLCAnbm8tY2FjaGUnKQogICAgICAgIHNlbGYuc2VuZF9oZWFkZXIoJ0V4cGlyZXMnLCAnMCcpCiAgICAgICAgc3VwZXIoKS5lbmRfaGVhZGVycygpCgogICAgIyA8c2NyaXB0IHR5cGU9Im1vZHVsZSI+IGV4aWdlIE1JTUUgZGUgSmF2YVNjcmlwdAogICAgZGVmIGd1ZXNzX3R5cGUoc2VsZiwgcGF0aCk6CiAgICAgICAgaWYgcGF0aC5lbmRzd2l0aCgoJy5qcycsICcubWpzJykpOgogICAgICAgICAgICByZXR1cm4gJ3RleHQvamF2YXNjcmlwdCcKICAgICAgICByZXR1cm4gc3VwZXIoKS5ndWVzc190eXBlKHBhdGgpCgoKY2xhc3MgU2Vydmlkb3IoaHR0cC5zZXJ2ZXIuVGhyZWFkaW5nSFRUUFNlcnZlcik6CiAgICAjIFVtYSB0aHJlYWQgcG9yIGNvbmV4YW86IG8gQ2hyb21lIGFicmUgY29uZXhvZXMgImRlIHJlc2VydmEiIHF1ZSBmaWNhbSBvY2lvc2FzLAogICAgIyBlIHVtIHNlcnZpZG9yIGRlIHRocmVhZCB1bmljYSB0cmF2YSBlc3BlcmFuZG8gcG9yIGVsYXMgKHBhZ2luYSBmaWNhIHNlbSBKUykuCiAgICBkYWVtb25fdGhyZWFkcyA9IFRydWUKICAgICMgTm8gV2luZG93cywgU09fUkVVU0VBRERSIGRlaXhhIERPSVMgc2Vydmlkb3JlcyBlc2N1dGFyZW0gYSBtZXNtYSBwb3J0YSBzZW0gZXJyby4KICAgIGFsbG93X3JldXNlX2FkZHJlc3MgPSBGYWxzZQoKICAgIGRlZiBzZXJ2ZXJfYmluZChzZWxmKToKICAgICAgICAjIEUgU09fRVhDTFVTSVZFQUREUlVTRSBpbXBlZGUgcXVlIG91dHJvIHNlcnZpZG9yIHNlIGluc3RhbGUgZGVwb2lzIGVtIGNpbWEgZGVzdGUuCiAgICAgICAgaWYgaGFzYXR0cihzb2NrZXQsICdTT19FWENMVVNJVkVBRERSVVNFJyk6CiAgICAgICAgICAgIHNlbGYuc29ja2V0LnNldHNvY2tvcHQoc29ja2V0LlNPTF9TT0NLRVQsIHNvY2tldC5TT19FWENMVVNJVkVBRERSVVNFLCAxKQogICAgICAgIHN1cGVyKCkuc2VydmVyX2JpbmQoKQoKCmRlZiBwb3J0YV9lbV91c28ocG9ydGEpOgogICAgIyBUZXN0YSBzZSBBTEdVRU0gamEgYXRlbmRlIGEgcG9ydGEuIFNvIG8gZXJybyBkbyBiaW5kIG5hbyBiYXN0YTogbm8gV2luZG93cywgc2UgbwogICAgIyBvdXRybyBzZXJ2aWRvciB1c291IFNPX1JFVVNFQUREUiwgbyBiaW5kIG51bSBlbmRlcmVjbyBtYWlzIGVzcGVjaWZpY28gZSBhY2VpdG8uCiAgICAjIFRlc3RhIHRhbWJlbSA6OjEgcG9ycXVlICJsb2NhbGhvc3QiIHBvZGUgcmVzb2x2ZXIgcGFyYSBJUHY2LgogICAgZm9yIGhvc3QgaW4gKCcxMjcuMC4wLjEnLCAnOjoxJyk6CiAgICAgICAgdHJ5OgogICAgICAgICAgICB3aXRoIHNvY2tldC5jcmVhdGVfY29ubmVjdGlvbigoaG9zdCwgcG9ydGEpLCB0aW1lb3V0PTAuMyk6CiAgICAgICAgICAgICAgICByZXR1cm4gVHJ1ZQogICAgICAgIGV4Y2VwdCBPU0Vycm9yOgogICAgICAgICAgICBwYXNzCiAgICByZXR1cm4gRmFsc2UKCgpzZXJ2aWRvciA9IE5vbmUKZm9yIHBvcnRhIGluIHJhbmdlKFBPUlRBX0lOSUNJQUwsIFBPUlRBX0lOSUNJQUwgKyBURU5UQVRJVkFTKToKICAgIGlmIHBvcnRhX2VtX3Vzbyhwb3J0YSk6CiAgICAgICAgcHJpbnQoJ1BvcnRhICVkIG9jdXBhZGEsIHRlbnRhbmRvIGEgcHJveGltYS4uLicgJSBwb3J0YSkKICAgICAgICBjb250aW51ZQogICAgdHJ5OgogICAgICAgICMgU28gbyBwcm9wcmlvIGNvbXB1dGFkb3IgYWNlc3NhIChuYW8gZXhwb2Ugb3MgYXJxdWl2b3MgbmEgcmVkZSBuZW0gYWNpb25hIG8gZmlyZXdhbGwpCiAgICAgICAgc2Vydmlkb3IgPSBTZXJ2aWRvcigoJzEyNy4wLjAuMScsIHBvcnRhKSwgSGFuZGxlcikKICAgICAgICBicmVhawogICAgZXhjZXB0IE9TRXJyb3I6CiAgICAgICAgcHJpbnQoJ1BvcnRhICVkIG9jdXBhZGEsIHRlbnRhbmRvIGEgcHJveGltYS4uLicgJSBwb3J0YSkKCmlmIHNlcnZpZG9yIGlzIE5vbmU6CiAgICBwcmludCgnRVJSTzogbmVuaHVtYSBwb3J0YSBsaXZyZSBlbnRyZSAlZCBlICVkLicgJSAoUE9SVEFfSU5JQ0lBTCwgUE9SVEFfSU5JQ0lBTCArIFRFTlRBVElWQVMgLSAxKSkKICAgIHN5cy5leGl0KDEpCgp1cmwgPSAnaHR0cDovL2xvY2FsaG9zdDolZC8nICUgcG9ydGEKcHJpbnQoJycpCnByaW50KCdleHRQbGFubmVyIHJvZGFuZG8gZW0gJXMnICUgdXJsKQppZiBwb3J0YSAhPSBQT1JUQV9JTklDSUFMOgogICAgcHJpbnQoJ0FURU5DQU86IGEgcG9ydGEgJWQgZXN0YXZhIG9jdXBhZGEuIE9zIGRhZG9zIGRlIHRlc3RlIChsb2NhbFN0b3JhZ2UpIHNhbyBwb3IgcG9ydGEsJyAlIFBPUlRBX0lOSUNJQUwpCiAgICBwcmludCgnICAgICAgICAgZW50YW8gb3MgaXRlbnMgc2Fsdm9zIGVtIGxvY2FsaG9zdDolZCBuYW8gYXBhcmVjZW0gbmVzdGEgcG9ydGEuJyAlIFBPUlRBX0lOSUNJQUwpCnByaW50KCdQYXJhIHBhcmFyOiBmZWNoZSBlc3RhIGphbmVsYSBvdSBwcmVzc2lvbmUgQ3RybCtDLicpCnByaW50KCcnKQoKaWYgQUJSSVJfTkFWRUdBRE9SOgogICAgd2ViYnJvd3Nlci5vcGVuKHVybCkKdHJ5OgogICAgc2Vydmlkb3Iuc2VydmVfZm9yZXZlcigpCmV4Y2VwdCBLZXlib2FyZEludGVycnVwdDoKICAgIHByaW50KCdTZXJ2aWRvciBlbmNlcnJhZG8uJykK')))" <nul

if not exist "%SERVER%" (
    echo ERRO: falha ao preparar o servidor embutido.
    pause
    exit /b 1
)

REM Python: prefere o lancador "py"; "python" pode ser so o atalho da Microsoft Store
set "PY="
py -3 --version >nul 2>&1 && set "PY=py -3"
if not defined PY (python --version >nul 2>&1 && set "PY=python")
if not defined PY (
    echo ERRO: Python 3 nao encontrado. Instale em https://www.python.org/downloads/
    pause
    exit /b 1
)

REM cmd /k mantem a janela aberta se o servidor der erro (a mensagem fica visivel)
echo Iniciando o servidor na janela "extPlanner Servidor"...
start "extPlanner Servidor" cmd /k %PY% "%SERVER%"

echo.
echo ============================================================
echo  O navegador abre sozinho quando o servidor estiver pronto.
echo  O endereco (normalmente http://localhost:8000) aparece na
echo  janela "extPlanner Servidor".
echo  Apos editar arquivos, basta recarregar a pagina (F5).
echo  Para PARAR: feche a janela do servidor ou Ctrl+C nela.
echo ============================================================
