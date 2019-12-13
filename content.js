var courses = document.getElementsByClassName("gradebook-course");

var PRINT_VALS = false;

var SHOW_OVERALL_GRADE = true;

var course_weighted_sum = 0;
var course_credits_sum = 0;

var cat_dict = {};

var course_array = [];

var btn_to_course_dict = {};

var non_empty_grade_count = 0;
var total_grade_count = 0;

var click_count = 0;

var popup_selected_course = null;


class Course
{
	constructor(c, e)
	{
		this.course_title = c;
		this.course_elem = e;
		this.has_filler_cat = false;
		this.cats = [];
	}

	add_category(a)
	{
		if(a.is_filler)
		{
			this.has_filler_cat = true;
		}
		this.cats.push(a);
	}

	remove_category(index)
	{
		this.cats.splice(index, 1);
	}

	get_last_category()
	{
		return this.cats[this.cats.length - 1];
	}

	calculate_grade()
	{
		var included_cats = 0;
		var total_num = 0;
		var total_denom = 0;
		for(var i = 0; i < this.cats.length; i++)
		{
			if(!this.cats[i].is_empty && this.cats[i].weight != null)
			{
				total_num += this.cats[i].calculate_average();
				total_denom += this.cats[i].weight;
				included_cats++;
			}
			else
			{
				// this.remove_category(i);
			}
		}
		if(included_cats == 0)
		{
			var t_cat = new Category(1, null);
			t_cat.add_grade(1, 1, "", "", "");
			total_num += 1;
			total_denom += 1;
			t_cat.is_filler = true;
			this.add_category(t_cat);
		}

		if(total_denom == 0)
		{
			return 0;	
		}

		if(this.has_filler_cat)
		{
			return 1;
		}

		return total_num/total_denom;
	}
}

class Category
{
	constructor(w, e)
	{
		this.weight = w;
		this.is_empty = true;
		this.is_filler = false;
		this.grades = [];
		this.elem = e;
	}

	add_grade(g, m, d, n, e)
	{
		let dict = {};
		dict.given = g;
		dict.max = m;
		dict.date = d;
		dict.name = n;
		dict.elem = e;
		dict.count_grade = true;
		this.is_empty = false;
		this.grades.push(dict);
	}

	remove_grade(i)
	{
		this.grades.splice(i, 1);
	}

	calculate_average()
	{
		var total_given = 0;
		var total_max = 0;

		for(let i of this.grades)
		{
			if(i.count_grade)
			{
				total_given += i.given;
				total_max += i.max;
			}	
		}

		if(total_max != 0 && this.weight != null)
		{
			return this.weight*(total_given/total_max);
		}
		return 0;
	}
}

var body_elem = document.getElementById("main-inner");


var body_overall = document.getElementById("body");

var popup_cont = document.createElement("div");

popup_cont.classList.add("popup-cont");

var svg_text = '<svg viewPort="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg"><line x1="1" y1="11" x2="11" y2="1" stroke="black" stroke-width="2"/><line x1="1" y1="1" x2="11" y2="11" stroke="black" stroke-width="2"/></svg>'

// var inner_text = '<div id="popup"> <div id="close-btn">' + svg_text + '</div><div id="popup-header-cont"><span id="popup-main-header">Finals Grade Calculator</span><span id="popup-secondary-header">Test Class Value</span></div><div id="popup-final-grade-cont"><span id="popup-needed-grade">--.-%</span></div><div id="popup-body-cont"><input id="popup-desired-input" class="popup-input" type="number" min="0" max="100" placeholder="Desired Overall Grade for Course(e.g. 93.5)"/><input id="popup-weight-input" class="popup-input" type="number" min="0" max="100" placeholder="Final Weight(e.g. 20.0)"/></div><div id="popup-footer-cont"><button id="popup-calc-btn">Calculate Grade Needed on Final</button></div></div><div id="popup-mask"></div>';

var inner_text = '<div id="popup"> <div id="close-btn">' + svg_text + '</div><div id="popup-header-cont"><span id="popup-main-header">Finals Grade Calculator</span><select id="popup-dropdown-header"></select></div><div id="popup-final-grade-cont"><span id="popup-needed-grade">--.-%</span></div><div id="popup-body-cont"><span id="popup-error">Error</span><input id="popup-desired-input" class="popup-input" type="number" min="0" max="100" placeholder="Desired Overall Grade for Course(e.g. 93.5)"/><input id="popup-weight-input" class="popup-input" type="number" min="0" max="100" placeholder="Final Weight(e.g. 20.0)"/></div><div id="popup-footer-cont"><button id="popup-calc-btn">Calculate Grade Needed on Final</button></div></div><div id="popup-mask"></div>';

var font_text = '<link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500&display=swap" rel="stylesheet">';

var head_innerHTML = document.getElementsByTagName('head')[0].innerHTML;

document.getElementsByTagName('head')[0].innerHTML = font_text + head_innerHTML;

popup_cont.innerHTML = inner_text;

body_overall.insertBefore(popup_cont, body_overall.childNodes[0]);

document.getElementById('popup-dropdown-header').addEventListener('change', function() {
	var curr_val = this.options[this.selectedIndex].value;
	var width_val = curr_val.length*10 + 5;
	this.setAttribute("style", "width: " + width_val + "px;");

	var course_arr_val = this.options[this.selectedIndex].getAttribute("coursearr");
	popup_selected_course = course_array[course_arr_val];
});

var body_main_elem = document.getElementById("main-inner");

//fgc = finals grade calculator
var fgc_btn_wrapper = document.createElement("div");

var fgc_button = document.createElement("a");

var node = document.createTextNode("Finals Grade Calculator");

fgc_button.setAttribute("class", "link-btn");

fgc_btn_wrapper.setAttribute("class", "download-grade-wrapper");
fgc_btn_wrapper.setAttribute("style", "right: 201.84px");
// fgc_button.setAttribute("onClick", "show_most_harmfuls()");
fgc_button.appendChild(node);
fgc_btn_wrapper.appendChild(fgc_button);
body_main_elem.insertBefore(fgc_btn_wrapper, body_main_elem.childNodes[0]);


fgc_button.addEventListener('click', function() {
	document.getElementById("popup-desired-input").value = "";
	document.getElementById("popup-weight-input").value = "";
	document.getElementById("popup-needed-grade").innerHTML = "--.-%";
	document.getElementById("popup-error").innerHTML = "";
	popup_cont.classList.add("display-popup-cont");
	setTimeout(()=>{}, 10);
	popup_cont.classList.add("opacity-fade-in");
}, false);


document.getElementById("close-btn").addEventListener("click", function() {
	popup_cont.classList.remove("display-popup-cont");
	setTimeout(()=>{}, 10);
	popup_cont.classList.remove("opacity-fade-in");
});

document.getElementById("popup-calc-btn").addEventListener("click", function() {
	if(popup_selected_course != null)
	{
		var d = document.getElementById("popup-desired-input").value;
		var w = document.getElementById("popup-weight-input").value;
		var c = popup_selected_course.calculate_grade();
		var error_elem = document.getElementById("popup-error");

		if(d == "" || w == "")
		{
			error_elem.innerHTML = 'Please fill in all of the fields.';
		}
		else
		{
			if(!isNaN(d) && !isNaN(w))
			{
				if(!(d == 0 || w == 0))
				{
					if(d <= 100 && w <= 100)
					{
						error_elem.innerHTML = '';
						d = parseFloat(d);
						w = parseFloat(w);
						console.log(d);
						console.log(w);
						console.log(c);
						var final_grade = (d - c*(100.0 - w))/w;
						var percent_str = roundTo((final_grade*100), 2) + "%";
						if(final_grade > 1.10)
						{
							document.getElementById("popup-needed-grade").innerHTML = "...Let's just say you need some major extra credit.";
						}
						else
						{
							document.getElementById("popup-needed-grade").innerHTML = percent_str;
						}
					}
					else
					{
						error_elem.innerHTML = 'Please enter a value less than 100%.';
					}
				}
				else
				{
					error_elem.innerHTML = 'Please enter in a value greater than 0%.';
				}
			}
			else
			{
				error_elem.innerHTML = 'Please enter in a vaid number.';
			}
		}
	}
});

//iterate over courses
for(var i = 0; i < courses.length; i++)
{
	course_inners = courses[i].childNodes[1].firstChild.firstChild.childNodes;
	console.log("------------------");
	course_title = courses[i].getElementsByClassName("gradebook-course-title");
	var course_grades = courses[i].getElementsByClassName("gradebook-course-grades");
	//validates existence of element
	if(course_grades.length == 1)
	{
		course_grades = course_grades[0];
	}

	if(course_title.length != 0)
	{
		course_title = course_title[0].firstChild.innerHTML.split('>')[2].split('<')[0];
	}
	else
	{
		course_title = "No Course Title"
	}

	console.log(course_title);

	var c = new Course(course_title, courses[i]);
	course_array.push(c);

	//iterate over table rows
	for(var j = 0; j < course_inners.length; j++)
	{
		//filtering
		if(course_inners[j].getAttribute("data-parent-id") != "" && !course_inners[j].classList.contains("sim-row"))
		{
			//get the inner's title
			course_inner_title = course_inners[j].getElementsByClassName("title");
			if(course_inner_title.length == 1)
			{
				course_inner_title = course_inner_title[0].innerHTML;
			}
			else
			{
				course_inner_title = null;
			}

			//filtering
			if(course_inner_title != null && course_inner_title.includes("(no grading period)") && course_inners[j].classList.contains("period-row"))
			{
				break;
			}

			//grade weight text
			category_weight = course_inners[j].getElementsByClassName("percentage-contrib");



			if(category_weight.length != 0)
			{
				category_weight = category_weight[0].innerHTML;
			}
			else
			{
				category_weight = null;
			}


			if(course_inners[j].classList.contains("item-row") && !(course_inners[j].classList.contains("dropped")))
			{
				//table row is a grade

				grade_s = course_inners[j].childNodes[1].firstChild.childNodes;
				// grade_given = course_inners[j].childNodes[1].firstChild.firstChild.firstChild.innerHTML;
				// grade_max = course_inners[j].childNodes[1].firstChild.childNodes[1].innerHTML;
				grade_given = -1;
				grade_max = -1;
				grade_d = course_inners[j].firstChild.firstChild.firstChild.childNodes;
				grade_date = "";
				grade_n = course_inners[j].firstChild.firstChild.firstChild.childNodes;
				grade_name_elem = null;
				grade_name = "";

				for(var k in grade_d)
				{
					if(grade_d[k].className == "due-date")
					{
						grade_date = grade_d[k].innerHTML;
					}
					if(grade_n[k].className == "title")
					{
						grade_name_elem = grade_n[k].firstChild;
						grade_name = grade_n[k].firstChild.innerHTML;
					}
				}

				for(var k in grade_s)
				{
					if(grade_s[k].className == "awarded-grade")
					{
						grade_given = grade_s[k].firstChild.innerHTML;
					}
					else if(grade_s[k].className == "max-grade")
					{
						grade_max = grade_s[k].innerHTML;
					}	
				}

				//grade_given != "—" && (typeof grade_given !== 'undefined') && 
				if(grade_given != -1)
				{
					grade_max = grade_max.split("/")[1].substring(1);
					//console.log("\t\t" + "------------------");
					//console.log("\t\t" + grade_given + "/" + grade_max);
					grade_given = parseFloat(grade_given);
					grade_max = parseFloat(grade_max);
					grade_date = grade_date.slice(grade_date.indexOf("</span>") + 7, grade_date.length);
					grade_date = grade_date.slice(0, grade_date.indexOf(" "));
					grade_name = grade_name.slice(0, grade_name.indexOf("<"));
					if(grade_date != "")
					{
						grade_date = new Date(grade_date);
						non_empty_grade_count++;
					}
					total_grade_count++;

					// console.log(grade_name + ": " + grade_given +  "/" + grade_max);
					course_inners[i].onmouseover = function() 
					{
						on_enter(this);
					};
					course_inners[i].onmouseout = function() 
					{
						on_enter(this);
					};
					c.get_last_category().add_grade(grade_given, grade_max, grade_date, grade_name, grade_name_elem);
					if(PRINT_VALS)
					{
						console.log("\t\t" + "------------------");
						console.log("\t\t" + grade_given + " / " + grade_max);
					}
				}

				if(course_inners[j].classList.contains("last-row-of-tier"))
				{
					course_inners[j].classList.remove("last-row-of-tier");
					var duplicate_elem = document.createElement('tr');
					duplicate_elem.setAttribute("class", "report-row item-row last-row-of-tier sim-row");
					duplicate_elem.setAttribute("data-parent-id", course_inners[j].getAttribute("data-parent-id"));
					course_inners[j].insertAdjacentElement("afterEnd", duplicate_elem);

					duplicate_elem.innerHTML = '<th scope="row" class="title-column"><div class="reportSpacer-3"><div class="td-content-wrapper"><span class="title"><input type="text" class="grade-name-input"></span> </div></div></th><td class="grade-column"><div class="td-content-wrapper"><span class="awarded-grade"><span class="rounded-grade"><input type="number" class="given-grade-input" min="0"></span></span><span class="max-grade">&nbsp;/ <input class="max-grade-input" type="number" min="0"></span><div class="grade-wrapper"></div></div></td><td class="comment-column"><div class="td-content-wrapper add-grade-cont"><a class="sim-add-btn">+&emsp;Add Simulated Grade</a><span class="visually-hidden">No comment</span></div></td>';
					duplicate_elem.getElementsByClassName("sim-add-btn")[0].addEventListener("click", 
					function()
					{
						var prev_elem = this.parentNode.parentNode.parentNode.previousSibling;
						var duplicate_elem = this.parentNode.parentNode.parentNode;
						var grade_name_input = duplicate_elem.getElementsByClassName("grade-name-input")[0];
						var given_grade_input = duplicate_elem.getElementsByClassName("given-grade-input")[0];
						var max_grade_input = duplicate_elem.getElementsByClassName("max-grade-input")[0];

						var grade_name_input_value = grade_name_input.value;
						var given_grade_input_value = given_grade_input.value;
						var max_grade_input_value = max_grade_input.value;

						if(given_grade_input_value != "" && max_grade_input_value != "")
						{
							var data_parent_id = prev_elem.getAttribute("data-parent-id");

							var cat_obj = cat_dict[data_parent_id];

							var grade_arr_length = cat_obj.grades.length;

							var new_elem = document.createElement('tr');
							new_elem.setAttribute("data-parent-id", data_parent_id);
							new_elem.setAttribute("class", "report-row item-row last-row-of-tier sim-grade-row");
							var new_elem_text = '<th scope="row" class="title-column"><div class="reportSpacer-3"><div class="td-content-wrapper"><span class="title">' + grade_name_input_value + '</span> </div></div></th><td class="grade-column"><div class="td-content-wrapper"><span class="awarded-grade"><span class="rounded-grade">' + given_grade_input_value + '</span></span><span class="max-grade"> / ' + max_grade_input_value + '</span><div class="grade-wrapper"></div></div></td><td class="comment-column"><div class="td-content-wrapper"><a class="sim-remove-btn" given="' + given_grade_input_value + '" max="' + max_grade_input_value + '" arrpos="' + grade_arr_length + '">-&emsp;Remove</a><span class="visually-hidden">No comment</span></div></td>';
							new_elem.innerHTML = new_elem_text;
							prev_elem.insertAdjacentElement("afterEnd", new_elem);
							grade_name_input.value = "";
							given_grade_input.value = "";
							max_grade_input.value = "";

							new_elem.getElementsByClassName("sim-remove-btn")[0].addEventListener('click', function() {
								var given = parseFloat(this.getAttribute("given"));
								var max = parseFloat(this.getAttribute("max"));

								data_parent_id = this.parentNode.parentNode.parentNode.previousSibling.getAttribute("data-parent-id");
								
								var cat_obj = cat_dict[data_parent_id];

								reset_calcs();

								console.log(cat_obj.grades);
								console.log(this.innerHTML);

								console.log(this.getAttribute("arrpos"));
								cat_obj.remove_grade(this.getAttribute("arrpos"));


								for(var c of course_array)
								{
									display_changes(c, SHOW_OVERALL_GRADE);
								}

								var full_elem = this.parentNode.parentNode.parentNode;

								full_elem.parentNode.removeChild(full_elem);
							});

							reset_calcs();


							cat_obj.add_grade(parseFloat(given_grade_input_value), parseFloat(max_grade_input_value), "", grade_name_input_value, new_elem);
							for(var c of course_array)
							{
								display_changes(c, SHOW_OVERALL_GRADE);
							}
						}
					});

					j++;
				}
			}
			else if(course_inners[j].classList.contains("category-row"))
			{
				is_weightless = false;
				//checks if it has a weight to the course, if not set it to 0
				if(category_weight == null)
				{
					category_weight = "(0%)";
					is_weightless = true;
				}

				if(category_weight.charAt(0) == "(")
				{
					//table row is a category
					cat_weight = parseFloat(category_weight.split('(')[1].split('%')[0])/100;
					cat_elem = course_inners[j];

					//add category to course
					if(is_weightless)
					{
						cat_weight = null;
					}
					cat_data_id = cat_elem.getAttribute("data-id");
					new_cat = new Category(cat_weight, cat_elem);
					cat_dict[cat_data_id] = new_cat;
					c.add_category(new_cat);
					if(PRINT_VALS)
					{
						console.log("\t------------------");
						console.log("\t" + cat_weight);
					}
				}
			}
		}
	}
	// console.log(course_array);

	if(!c.course_title.includes("Advisory"))
	{
		display_changes(c, SHOW_OVERALL_GRADE);

		console.log(c);

		// display_rogerhub(c);
	}

}

console.log(course_array);

init_popup();

show_most_harmfuls();


//cleanly calculates grade using the round to
//@param c must be a course object
//@returns final grade as percentage from 0-100% 
function calculate_grade_clean(c)
{
	return roundTo((c.calculate_grade()*100), 2);
}

function get_course_from_elem(e)
{
	for(var course of course_array)
	{
		// console.log("----");
		// console.log(course.course_elem);
		// console.log(e);
		if(course.course_elem == e)
		{
			return course;
		}
	}
	return null;
}

function init_popup() {
	populate_dropdown();
	var popup_dd = document.getElementById('popup-dropdown-header');
	var curr_val = popup_dd.options[popup_dd.selectedIndex].value;
	var width_val = curr_val.length*10 + 5;
	popup_dd.setAttribute("style", "width: " + width_val + "px;");

	var course_arr_val = popup_dd.options[popup_dd.selectedIndex].getAttribute("coursearr");
	popup_selected_course = course_array[course_arr_val];
}

function display_rogerhub(c)
{
	var course_elem = c.course_elem;
	if(course_elem != null)
		course_elem = course_elem.getElementsByClassName("gradebook-course-title");


	if(course_elem.length == 1)
	{
		course_elem = course_elem[0];

		course_elem.setAttribute("style", "display: flex; justify-content: space-between;");

		var rh_button = document.createElement("a");

		rh_button.setAttribute("class", "additional-actions");

		rh_button.appendChild(document.createTextNode("..."));

		course_elem.appendChild(rh_button);

		var parent_elem = course_elem.parentNode.parentNode;

		// btn_to_course_dict.push

		rh_button.addEventListener('click', function(event) {

			var gradebook_cont = parent_elem.getElementsByClassName("gradebook-course-grades")[0];

			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			//!!!!!!!!!!!!important line!!!!!!!!!!!!!
			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			event.stopPropagation();
			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			//!!!!!!!!!!!!important line!!!!!!!!!!!!!
			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

			gradebook_cont.setAttribute("style", "display: none;");

			document.getElementById("popup-desired-input").value = "";
			document.getElementById("popup-weight-input").value = "";
			document.getElementById("popup-needed-grade").innerHTML = "--.-%";
			document.getElementById("popup-error").innerHTML = "";
			popup_cont.classList.add("display-popup-cont");
			setTimeout(()=>{}, 10);
			popup_cont.classList.add("opacity-fade-in");
		}, true);
	}
}

function display_changes(c, show_grade)
{
	if(show_grade)
	{
		var raw_final_grade = calculate_grade_clean(c);
		// console.log(raw_final_grade);
		var letter_final_grade = letter_grade_to_num(raw_final_grade);
		// console.log(letter_final_grade  + ", " + raw_final_grade);
		var final_displayed_grade = '<span class="added-text">&emsp;(' + letter_final_grade + ", " + raw_final_grade + "%" + ")</span>";
		c.course_elem.firstChild.firstChild.innerHTML = c.course_elem.firstChild.firstChild.innerHTML + final_displayed_grade;
	}

	// console.log(c);

	//calculates category grades
	calculate_category_grades(c);
}

//calculates category grade
//cat is short for category its not a cat
function calculate_category_grades(c)
{
	for(var cat of c.cats)
	{
		if(cat.elem != null)
		{
			var d = cat.elem.getElementsByClassName("title");

			if(d.length == 1 && !cat.is_empty && cat.weight != null)
			{
				var inner_val = d[0].innerHTML;
				var p = roundTo((cat.calculate_average()*100)/cat.weight, 2);
				d[0].innerHTML = inner_val + '<span class="added-text">&emsp;(' + p + "%)</span>";
			}
		}
	}
}

function on_enter(thing)
{
	// console.log("enter");
}

function on_exit(thing)
{
	// console.log("exit");
}

function reset_calcs()
{
	added_elems = document.getElementsByClassName("added-text");
	for(var i = 0; i < added_elems.length; i++)
	{
		added_elems[i--].remove();
	}
}

function populate_dropdown() {
	var dd_elem = document.getElementById("popup-dropdown-header");
	for(var i = 0; i < course_array.length; i++)
	{
		var new_option = document.createElement('option');
		var title = course_array[i].course_title.split(":")[0];
		new_option.setAttribute("value", title);
		new_option.innerHTML = title;
		new_option.setAttribute('coursearr', i);
		if(!title.includes("Advisory"))
			dd_elem.appendChild(new_option);
	}
}

//rounding function
//https://stackoverflow.com/questions/15762768/javascript-math-round-to-two-decimal-places
function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
        if( n < 0) {
        negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
        n = (n * -1).toFixed(2);
    }
    return n;
}

//gpa stuff
function value(title, grade) {
	var ranges = [96.5, 92.5, 89.5, 86.5, 82.5, 79.5, 76.5, 72.5, 69.5, 66.5, 62.5, 59.5, 0]

	honors = false;

	if(title.includes("Honors") || title.includes("AP®"))
	{
		honors = true;
	}

	for(var i = 0; i < ranges.length; i++)
	{
		if(grade >= ranges[i])
		{
			    var values = [4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.7, 0];
			    var value = 0;
			    if (honors == 1) {
			        value += 0.5;
			    }
			    value += values[i];
			    if(title.includes("CSD") || title.includes("Programming"))
			    {
			    	value *= 0.5;
			    }
			    return value;
		}
	}
}


function letter_grade_to_num(grade)
{
	var ranges = [96.5, 92.5, 89.5, 86.5, 82.5, 79.5, 76.5, 72.5, 69.5, 66.5, 62.5, 59.5, 0];
	var grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

	for(var i = 0; i < ranges.length; i++)
	{
		if(grade >= ranges[i])
		{
			    return grades[i];
		}
	}
}

//sets the most harmful element to red
//@param arr takes in array of courses
// function show_most_harmfuls(arr)
// {
// 	for(var c of arr)
// 	{
// 		if(most_harmful(c))
// 		{
// 			most_harmful(c).elem.style = "color: red";
// 		}
// 	}
// }

function show_most_harmfuls()
{
	for(var c of course_array)
	{
		var most_harm_var = most_harmful(c);
		if(most_harm_var != null && most_harm_var.elem != null)
		{
			most_harm_var.elem.style = "color: red";
		}
	}
}


//returns grade in dictionary with most harmful effect on grade
//@param course must be a course object
function most_harmful(course)
{
	// console.log("----------------");
	// console.log(course.course_title);
	let base_val = calculate_grade_clean(course);
	var m_impact = null;
	var m_impact_val = base_val;
	for(var cat of course.cats)
	{
		if(cat.grades.length == 1)
		{
			temp = cat.weight;
			cat.weight = 0;
			curr_val = calculate_grade_clean(course);
			cat.weight = temp;
			if((m_impact_val - base_val) < (curr_val - base_val))
			{
				m_impact_val = curr_val;
				m_impact = cat.grades[0];
			}
		}
		else
		{
			for(var grade of cat.grades)
			{
				grade.count_grade = false;
				curr_val = calculate_grade_clean(course);
				grade.count_grade = true;
				// console.log(grade.name + ": " + (curr_val - base_val));
				if((m_impact_val - base_val) < (curr_val - base_val))
				{
					m_impact_val = curr_val;
					m_impact = grade;
				}
			}
		}
	}

	if(m_impact != null)
	{
		return m_impact;
	}
	else
	{
		return null;
	}
}
