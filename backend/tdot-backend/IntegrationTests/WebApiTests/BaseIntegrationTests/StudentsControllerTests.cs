using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Core.DataTransferObjects;
using IntegrationTests.WebApiTests.Base;
using Xunit;
using MySqlX.XDevAPI;

namespace IntegrationTests.WebApiTests.BaseIntegrationTests
{
    public class StudentsControllerTests : IntegrationTestBase
    {
        public StudentsControllerTests(IntegrationTestWebAppFactory webApplicationFactory) : base(webApplicationFactory)
        {
        }

        [Fact]
        public async Task GetAllStudents_Should_Return_Ok()
        {           
            var response = await _httpClient.GetAsync("/api/students");
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetStudentById_Should_Return_Ok()
        {
            var student = new StudentDto("if4500103", "test", "test", "5AHIF");
            var content = new StringContent(JsonSerializer.Serialize(student), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/api/students", content);
            var studentId = "if450103";
            response = await _httpClient.GetAsync($"/api/students/{studentId}");
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CreateStudent_Should_Return_Created()
        {
            var student = new StudentDto("if888888", "test2", "test2", "5AHIF");
            var content = new StringContent(JsonSerializer.Serialize(student), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/api/students", content);
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task DeleteStudentById_Should_Return_NoContent()
        {
            var student = new StudentDto("if777777", "test", "test", "5AHIF");
            var content = new StringContent(JsonSerializer.Serialize(student), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/api/students", content);            
            var studentId = "if777777";
            response = await _httpClient.DeleteAsync($"/api/students/{studentId}");
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
