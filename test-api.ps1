$json = @{
    name = "João Silva"
    email = "joao@test.com"
    phone = "11999999999"
    password = "senha123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $json `
    -SkipHttpErrorCheck

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
