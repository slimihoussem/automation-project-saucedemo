*** Settings ***
Library           SeleniumLibrary
Variables         ../resources/config.json
Resource          ../resources/keywords.resource

Suite Setup       Open Browser    ${URL}    ${BROWSER}
Suite Teardown    Close Browser

*** Test Cases ***
Validate Burger Menu Functionality
    [Documentation]    Strict 11-step validation of the sidebar navigation.
    
    # 1. Login
    Login To Swag Labs    ${USER}    ${PASS}
    
    # 2-4. Open and Verify Menu
    Open Sidebar Menu
    Verify Sidebar Options
    
    # 5. All Items
    Click Element    ${locators['item_link']}
    Wait Until Location Is    ${URL}inventory.html
    
    # 6. About Link
    Open Sidebar Menu
    Click Element    ${locators['about_link']}
    
    # Monitor for navigation
    ${status}=    Run Keyword And Return Status    Wait Until Location Contains    saucelabs.com    timeout=7s
    IF    not ${status}
        Click Element    ${locators['about_link']}
        Wait Until Location Contains    saucelabs.com    timeout=15s
    END
    
    # 7. Return to App
    Go Back
    Wait Until Location Contains    inventory.html    timeout=10s
    Reload Page
    Wait Until Element Is Visible    ${locators['menu_btn']}    timeout=10s

    # 7.5 ADDED STEP: Add a product to ensure Reset has something to clear
    Add Item To Cart
    
    # 8 & 9. Reset App State (Now validates the badge disappears)
    Reset App State And Verify Cart
    
    # 10 & 11. Logout and Verify Login Page
    Logout From App
    Location Should Be    ${URL}