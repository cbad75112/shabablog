---
分類: C#
標題: C# API CORS問題
時間: 2025/6/5 下午2:20:27
---

## 問題說明

在建立 ASP.NET Core API 時，若前端（例如 Quasar 或 Vue）無法連線成功，常見原因之一是 **CORS（跨來源資源共享）** 未正確設定。

以下是可行的設定範例。

---

## Startup.cs 設定範例

```csharp
public class Startup
{
    //readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // 這個方法在啟動時呼叫，用來註冊服務
    public void ConfigureServices(IServiceCollection services)
    {
        // 可改成自訂名稱策略
        //services.AddCors(options =>
        //{
        //    options.AddPolicy(name: MyAllowSpecificOrigins,
        //        policy =>
        //        {
        //            policy.WithOrigins("http://example.com",
        //                                "http://www.contoso.com");
        //        });
        //});

        services.AddControllers();

        services.AddKtghJwt(options =>
        {
            options.SecretSource = SecretSourceType.HIS;
        });

        services.AddSignalR();
    }

    // 這個方法在啟動時呼叫，用來設定 HTTP Pipeline
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseHttpsRedirection();

        // ✅ 建議在此全域開啟 CORS
        app.UseCors(b =>
        {
            b.WithOrigins(
                "http://localhost:8080",
                "https://hisportal-2019.ktgh.com.tw",
                "http://m-surgrec.ktgh.com.tw",
                "http://hisportal-2019.ktgh.com.tw",
                "http://localhost:9000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });

        //app.UseCors(MyAllowSpecificOrigins);

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<NotificationHub>("/notificationHub");
        });
    }
}
