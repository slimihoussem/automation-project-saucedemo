*** Settings ***
Library           SeleniumLibrary
Variables         config.json


*** Keywords ***
Login To Swag Labs
    [Arguments]    ${username}    ${password}
    Wait Until Element Is Visible    ${locators['login_user']}    timeout=10s
    Input Text        ${locators['login_user']}    ${username}
    Input Password    ${locators['login_pass']}    ${password}
    Click Button      ${locators['login_btn']}
    Wait Until Location Contains    inventory.html    timeout=10s

Open Sidebar Menu
    # Check if the menu is already open
    ${is_open}=    Run Keyword And Return Status    Element Should Be Visible    ${locators['logout_link']}
    IF    not ${is_open}
        Wait Until Element Is Visible    ${locators['menu_btn']}    timeout=10s
        # Using Javascript to ensure the click isn't intercepted by animations
        Execute Javascript    document.getElementById('react-burger-menu-btn').click()
        # Wait for the specific About link to be ready
        Wait Until Element Is Visible    ${locators['about_link']}    timeout=10s
        Sleep    1s    # Buffer for CSS slide-in transition
    END

Verify Sidebar Options
    Wait Until Element Is Visible    ${locators['item_link']}    timeout=5s
    FOR    ${option}    IN    @{menu_labels}
        Element Should Contain    ${locators['menu_container']}    ${option}
    END

*** Keywords ***
# ... (Keep existing Login and Open Sidebar keywords)

Add Item To Cart
    [Documentation]    Adds the first available item to the cart and verifies the badge appears.
    Wait Until Element Is Visible    ${locators['add_to_cart_btn']}    timeout=5s
    Click Button                     ${locators['add_to_cart_btn']}
    Wait Until Element Is Visible    ${locators['cart_badge']}         timeout=5s
    Element Text Should Be           ${locators['cart_badge']}         1

*** Keywords ***
Reset App State And Verify Cart
    [Documentation]    Resets state and verifies if the UI actually updates the buttons.
    Open Sidebar Menu
    Wait Until Element Is Visible    ${locators['reset_link']}
    Click Element     ${locators['reset_link']}
    
    # Close the menu so we can see the product buttons
    Execute Javascript    document.getElementById('react-burger-cross-btn').click()
    Sleep    1s    # Small buffer for the UI to attempt an update
    
    # 1. Verify Cart Badge is gone (This usually passes)
    Page Should Not Contain Element      ${locators['cart_badge']}
    
    # 2. Verify Button Text has reverted (This is where the test will FAIL)
    # We expect the text to be 'Add to cart'
    Element Text Should Be    ${locators['add_to_cart_btn']}    Add to cart

Logout From App
    Open Sidebar Menu
    Wait Until Element Is Visible    ${locators['logout_link']}
    Click Element     ${locators['logout_link']}
    Wait Until Element Is Visible    ${locators['login_btn']}    timeout=10s