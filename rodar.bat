@echo off
setlocal
cd /d "%~dp0"

set PORT=8000
set SERVER=%TEMP%\extplanner_server.py

REM ---------------------------------------------------------------------------
REM Servidor Python embutido em Base64 (decodificado abaixo com powershell).
REM - Cache-Control: no-store  -> evita a armadilha do "python -m http.server"
REM   que cacheia os modulos ES (docs/MANUAL_TECNICO.md secao 3.11).
REM - Forca MIME text/javascript para .js (requisito de <script type=module>).
REM ---------------------------------------------------------------------------
powershell -NoProfile -Command "[IO.File]::WriteAllText('%SERVER%', [Text.Encoding]::ASCII.GetString([Convert]::FromBase64String('aW1wb3J0IGh0dHAuc2VydmVyLCBzb2NrZXRzZXJ2ZXIKClBPUlQgPSA4MDAwCgpjbGFzcyBIKGh0dHAuc2VydmVyLlNpbXBsZUhUVFBSZXF1ZXN0SGFuZGxlcik6CiAgICBkZWYgZW5kX2hlYWRlcnMoc2VsZik6CiAgICAgICAgc2VsZi5zZW5kX2hlYWRlcignQ2FjaGUtQ29udHJvbCcsICduby1zdG9yZSwgbm8tY2FjaGUsIG11c3QtcmV2YWxpZGF0ZSwgbWF4LWFnZT0wJykKICAgICAgICBzZWxmLnNlbmRfaGVhZGVyKCdQcmFnbWEnLCAnbm8tY2FjaGUnKQogICAgICAgIHNlbGYuc2VuZF9oZWFkZXIoJ0V4cGlyZXMnLCAnMCcpCiAgICAgICAgc3VwZXIoKS5lbmRfaGVhZGVycygpCgogICAgZGVmIGd1ZXNzX3R5cGUoc2VsZiwgcGF0aCk6CiAgICAgICAgaWYgcGF0aC5lbmRzd2l0aCgoJy5qcycsICcubWpzJykpOgogICAgICAgICAgICByZXR1cm4gJ3RleHQvamF2YXNjcmlwdCcKICAgICAgICByZXR1cm4gc3VwZXIoKS5ndWVzc190eXBlKHBhdGgpCgpzb2NrZXRzZXJ2ZXIuVENQU2VydmVyLmFsbG93X3JldXNlX2FkZHJlc3MgPSBUcnVlCndpdGggc29ja2V0c2VydmVyLlRDUFNlcnZlcigoJycsIFBPUlQpLCBIKSBhcyBzOgogICAgcHJpbnQoJ1NlcnZpZG9yIGVtIGh0dHA6Ly9sb2NhbGhvc3Q6JWQgIChDdHJsK0MgcGFyYSBwYXJhciknICUgUE9SVCkKICAgIHMuc2VydmVfZm9yZXZlcigpCg==')))" <nul

if not exist "%SERVER%" (
    echo ERRO: falha ao decodificar o servidor embutido.
    pause
    exit /b 1
)

REM Resolver o executavel do Python (python ou py)
where python >nul 2>&1 && set PY=python || set PY=py

echo Iniciando servidor em http://localhost:%PORT% ...
start "extPlanner Servidor" %PY% "%SERVER%"

timeout /t 2 /nobreak >nul
start "" "http://localhost:%PORT%/"

echo.
echo ============================================================
echo  Servidor rodando em uma janela separada ("extPlanner Servidor").
echo  Para PARAR: feche essa janela do servidor ou Ctrl+C nela.
echo  Apos editar arquivos .js, use Ctrl+Shift+R no navegador (hard reload).
echo ============================================================
